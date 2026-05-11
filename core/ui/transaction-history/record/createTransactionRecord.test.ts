import { create } from '@bufbuild/protobuf'
import { Chain } from '@vultisig/core-chain/Chain'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import {
  OneInchSwapPayload,
  OneInchSwapPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
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
