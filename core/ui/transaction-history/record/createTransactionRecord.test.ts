import { create } from '@bufbuild/protobuf'
import { Chain } from '@vultisig/core-chain/Chain'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import {
  OneInchSwapPayload,
  OneInchSwapPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import {
  RippleSpecificSchema,
  TransactionType,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import {
  Coin,
  CoinSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { THORChainSwapPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/thorchain_swap_payload_pb'
import { describe, expect, it } from 'vitest'

import { createTransactionRecord } from './createTransactionRecord'

const commEthCoin = (): Coin =>
  create(CoinSchema, {
    chain: Chain.Ethereum,
    ticker: 'ETH',
    address: '0x1111111111111111111111111111111111111111',
    contractAddress: '',
    decimals: 18,
    priceProviderId: '',
    isNativeToken: true,
    hexPublicKey: '',
    logo: '',
  })

const commRuneCoin = (): Coin => ({
  ...commEthCoin(),
  chain: Chain.THORChain,
  ticker: 'RUNE',
  address: 'thor1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
})

const commBtcCoin = (): Coin => ({
  ...commEthCoin(),
  chain: Chain.THORChain,
  ticker: 'BTC',
  address: 'thor1zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
})

const oneInchSwap = (
  provider: OneInchSwapPayload['provider']
): NonNullable<KeysignPayload['swapPayload']> & {
  case: 'oneinchSwapPayload'
} => ({
  case: 'oneinchSwapPayload',
  value: create(OneInchSwapPayloadSchema, {
    fromCoin: commEthCoin(),
    toCoin: {
      ...commEthCoin(),
      ticker: 'USDC',
      contractAddress: '0xusdc',
      isNativeToken: false,
    },
    fromAmount: '1000000000000000000',
    toAmountDecimal: '3000',
    provider,
  }),
})

const thorchainSwap = (): NonNullable<KeysignPayload['swapPayload']> & {
  case: 'thorchainSwapPayload'
} => ({
  case: 'thorchainSwapPayload',
  value: create(THORChainSwapPayloadSchema, {
    fromAddress: 'thor1from',
    fromCoin: commRuneCoin(),
    toCoin: commBtcCoin(),
    vaultAddress: 'thor1vault',
    fromAmount: '100000000',
    toAmountDecimal: '0.001',
    toAmountLimit: '0',
    streamingInterval: '0',
    streamingQuantity: '0',
    expirationTime: 0n,
    isAffiliate: false,
    fee: '0',
  }),
})

const keysignPayload = ({
  coin,
  swapPayload,
}: Pick<KeysignPayload, 'coin' | 'swapPayload'>): KeysignPayload =>
  create(KeysignPayloadSchema, {
    coin,
    toAddress: '0x2222222222222222222222222222222222222222',
    toAmount: '1000000000000000000',
    swapPayload,
  })

describe('createTransactionRecord', () => {
  it('records a TRON expired-unfreeze as a claim operation without persisting its routing marker', () => {
    const owner = 'TClaimOwner'
    const payload = create(KeysignPayloadSchema, {
      coin: create(CoinSchema, {
        chain: Chain.Tron,
        ticker: 'TRX',
        address: owner,
        decimals: 6,
        isNativeToken: true,
      }),
      toAddress: owner,
      toAmount: '12500000',
      memo: 'WITHDRAW_EXPIRE_UNFREEZE',
    })

    const record = createTransactionRecord({
      payload,
      txHash: 'tron-claim-hash',
      vaultId: 'vault-1',
    })

    expect(record.type).toBe('send')
    if (record.type !== 'send') return
    expect(record.data.operation).toBe('tronWithdrawExpireUnfreeze')
    expect(record.data.amount).toBe('12500000')
    expect(record.data.memo).toBeUndefined()
  })

  it('uses LI.FI scan URL for general LI.FI swap', () => {
    const txHash =
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    const record = createTransactionRecord({
      payload: keysignPayload({
        coin: commEthCoin(),
        swapPayload: oneInchSwap('li.fi'),
      }),
      txHash,
      vaultId: 'vault-1',
    })

    expect(record.type).toBe('swap')
    expect(record.explorerUrl).toBe(`https://scan.li.fi/tx/${txHash}`)
    expect(record.chain).toBe(Chain.Ethereum)
  })

  it('uses runescan with stripped 0x for native THORChain swap', () => {
    const txHash =
      '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    const record = createTransactionRecord({
      payload: keysignPayload({
        coin: commRuneCoin(),
        swapPayload: thorchainSwap(),
      }),
      txHash,
      vaultId: 'vault-1',
    })

    expect(record.type).toBe('swap')
    expect(record.explorerUrl).toBe(
      `https://runescan.io/tx/${txHash.replace(/^0x/i, '')}`
    )
    expect(record.chain).toBe(Chain.THORChain)
  })

  it('uses source chain block explorer for non-swap send', () => {
    const txHash =
      '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'
    const record = createTransactionRecord({
      payload: keysignPayload({
        coin: commEthCoin(),
        swapPayload: { case: undefined, value: undefined },
      }),
      txHash,
      vaultId: 'vault-1',
    })

    expect(record.type).toBe('send')
    expect(record.explorerUrl).toBe(
      getBlockExplorerUrl({
        chain: Chain.Ethereum,
        entity: 'tx',
        value: txHash,
      })
    )
    expect(record.chain).toBe(Chain.Ethereum)
  })

  it('uses source chain block explorer for general swap when provider is not LI.FI', () => {
    const txHash =
      '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
    const record = createTransactionRecord({
      payload: keysignPayload({
        coin: commEthCoin(),
        swapPayload: oneInchSwap('1inch'),
      }),
      txHash,
      vaultId: 'vault-1',
    })

    expect(record.type).toBe('swap')
    expect(record.explorerUrl).toBe(
      getBlockExplorerUrl({
        chain: Chain.Ethereum,
        entity: 'tx',
        value: txHash,
      })
    )
    expect(record.chain).toBe(Chain.Ethereum)
  })
})

describe('createTransactionRecord — XRPL trust-line activation', () => {
  const ISSUER = 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De'
  const HOLDER = 'rHolderAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
  const tokenId = `534F4C4F00000000000000000000000000000000.${ISSUER}`

  // The default limit the activation flow signs: 1e15 at 15 decimals.
  const trustLimit = '1000000000000000000000000000000'

  const trustSetPayload = (): KeysignPayload =>
    create(KeysignPayloadSchema, {
      coin: create(CoinSchema, {
        chain: Chain.Ripple,
        ticker: 'SOLO',
        address: HOLDER,
        contractAddress: tokenId,
        decimals: 15,
        isNativeToken: false,
      }),
      toAddress: ISSUER,
      toAmount: trustLimit,
      blockchainSpecific: {
        case: 'rippleSpecific',
        value: create(RippleSpecificSchema, {
          transactionType: TransactionType.RIPPLE_TRUST_SET,
        }),
      },
    })

  const record = () =>
    createTransactionRecord({
      payload: trustSetPayload(),
      txHash: '0xtrustline',
      vaultId: 'vault-1',
    })

  it('is not recorded as a send', () => {
    // Regression: the send fallback rendered the trust LIMIT as an outgoing
    // payment — 1,000,000,000,000,000 SOLO to the issuer, for a transaction
    // that moves nothing.
    expect(record().type).toBe('trustLine')
  })

  it('keeps the limit as a limit, not an amount', () => {
    const result = record()

    expect(result.type).toBe('trustLine')
    if (result.type !== 'trustLine') return

    expect(result.data.limit).toBe(trustLimit)
    expect(result.data).not.toHaveProperty('amount')
  })

  it('records the issuer as an issuer, not a payment recipient', () => {
    const result = record()

    expect(result.type).toBe('trustLine')
    if (result.type !== 'trustLine') return

    expect(result.data.issuer).toBe(ISSUER)
    expect(result.data).not.toHaveProperty('toAddress')
    expect(result.data.fromAddress).toBe(HOLDER)
  })

  it('carries the token so it stays searchable', () => {
    const result = record()

    expect(result.type).toBe('trustLine')
    if (result.type !== 'trustLine') return

    expect(result.data.token).toBe('SOLO')
    expect(result.data.tokenId).toBe(tokenId)
  })

  it('still records a native XRP payment as a send', () => {
    const payload = create(KeysignPayloadSchema, {
      coin: create(CoinSchema, {
        chain: Chain.Ripple,
        ticker: 'XRP',
        address: HOLDER,
        contractAddress: '',
        decimals: 6,
        isNativeToken: true,
      }),
      toAddress: 'rRecipientBBBBBBBBBBBBBBBBBBBBBBBBB',
      toAmount: '1000000',
    })

    expect(
      createTransactionRecord({ payload, txHash: '0xsend', vaultId: 'vault-1' })
        .type
    ).toBe('send')
  })

  it('does not claim a verbatim dApp transaction is a trust line', () => {
    // `signRipple` is signed as supplied; it may be an offer, not a TrustSet.
    const payload = trustSetPayload()
    payload.signData = {
      case: 'signRipple',
      value: { rawJson: JSON.stringify({ TransactionType: 'OfferCreate' }) },
    } as never

    expect(
      createTransactionRecord({ payload, txHash: '0xdapp', vaultId: 'vault-1' })
        .type
    ).toBe('send')
  })
})

describe('createTransactionRecord — a send of an already-held XRPL token', () => {
  const issuer = 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De'
  const holder = 'rHolderAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
  const recipient = 'rFriendBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'
  const soloTokenId = `534F4C4F00000000000000000000000000000000.${issuer}`

  const issuedTokenSend = (toAddress: string): KeysignPayload =>
    create(KeysignPayloadSchema, {
      coin: create(CoinSchema, {
        chain: Chain.Ripple,
        ticker: 'SOLO',
        address: holder,
        contractAddress: soloTokenId,
        decimals: 15,
        isNativeToken: false,
      }),
      toAddress,
      toAmount: '5000000000000000',
    })

  it('records a token send as a send, not a trust line', () => {
    // `toCommCoin` gives every non-fee coin a contractAddress, so this payload
    // is shaped exactly like a TrustSet. Classifying it as one would hide a
    // real payment behind a record that shows no amount at all.
    const result = createTransactionRecord({
      payload: issuedTokenSend(recipient),
      txHash: '0xtokensend',
      vaultId: 'vault-1',
    })

    expect(result.type).toBe('send')
  })

  it('keeps the recipient and amount of a token send', () => {
    const result = createTransactionRecord({
      payload: issuedTokenSend(recipient),
      txHash: '0xtokensend',
      vaultId: 'vault-1',
    })

    expect(result.type).toBe('send')
    if (result.type !== 'send') return

    expect(result.data.toAddress).toBe(recipient)
    expect(result.data.amount).toBe('5000000000000000')
  })

  it('records an ordinary redemption to the issuer as a send', () => {
    expect(
      createTransactionRecord({
        payload: issuedTokenSend(issuer),
        txHash: '0xtrustline',
        vaultId: 'vault-1',
      }).type
    ).toBe('send')
  })
})
