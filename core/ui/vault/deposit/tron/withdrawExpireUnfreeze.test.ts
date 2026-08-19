import { create } from '@bufbuild/protobuf'
import { WalletCore } from '@trustwallet/wallet-core'
import { getTronSigningInputs } from '@vultisig/core-mpc/keysign/signingInputs/resolvers/tron'
import { TronSpecificSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { describe, expect, it } from 'vitest'

import {
  getTronClaimableAmount,
  getTronClaimAmountDisplay,
  getTronClaimChainAmountDisplay,
  isTronWithdrawalClaimable,
  isTronWithdrawExpireUnfreezePayload,
  tronWithdrawExpireUnfreezeMemo,
} from './withdrawExpireUnfreeze'

const makeClaimPayload = ({
  ownerAddress = 'TClaimOwner',
  toAmount = '0',
}: {
  ownerAddress?: string
  toAmount?: string
} = {}) =>
  create(KeysignPayloadSchema, {
    coin: create(CoinSchema, {
      chain: 'Tron',
      ticker: 'TRX',
      address: ownerAddress,
      decimals: 6,
      isNativeToken: true,
    }),
    toAddress: ownerAddress,
    toAmount,
    memo: tronWithdrawExpireUnfreezeMemo,
    blockchainSpecific: {
      case: 'tronSpecific',
      value: create(TronSpecificSchema, {
        timestamp: 1n,
        expiration: 2n,
        blockHeaderTimestamp: 3n,
        blockHeaderNumber: 4n,
        blockHeaderVersion: 0n,
        blockHeaderTxTrieRoot: '00'.repeat(32),
        blockHeaderParentHash: '11'.repeat(32),
        blockHeaderWitnessAddress: '22'.repeat(21),
        gasEstimation: 999n,
      }),
    },
  })

describe('TRON expired-unfreeze claim', () => {
  it('keeps an above-safe-integer claim amount exact and excludes future entries', () => {
    expect(
      getTronClaimableAmount(
        [
          { expireTimeMs: 1, unfreezeAmountSun: 10_000_000_000_000_001n },
          { expireTimeMs: 3, unfreezeAmountSun: 7n },
        ],
        2
      )
    ).toBe('10000000000.000001')
  })

  it('formats the exact initiator claim amount shown before signing', () => {
    expect(
      getTronClaimAmountDisplay({
        amount: '10000000000.000001',
        ticker: 'TRX',
      })
    ).toBe('10000000000.000001 TRX')
  })

  it('formats an above-safe-integer history amount without a number round trip', () => {
    expect(
      getTronClaimChainAmountDisplay({
        amount: '10000000000000001',
        decimals: 6,
      })
    ).toBe('10000000000.000001')
  })

  it('renders the claim action only at or after expiry', () => {
    const now = 1_000

    expect(isTronWithdrawalClaimable(now - 1, now)).toBe(true)
    expect(isTronWithdrawalClaimable(now, now)).toBe(true)
    expect(isTronWithdrawalClaimable(now + 1, now)).toBe(false)
  })

  it('identifies only TRON claim payloads for post-broadcast refresh', () => {
    expect(
      isTronWithdrawExpireUnfreezePayload({
        chain: 'Tron',
        memo: tronWithdrawExpireUnfreezeMemo,
      })
    ).toBe(true)
    expect(
      isTronWithdrawExpireUnfreezePayload({
        chain: 'Tron',
        memo: 'UNFREEZE:BANDWIDTH',
      })
    ).toBe(false)
    expect(
      isTronWithdrawExpireUnfreezePayload({
        chain: 'Ethereum',
        memo: tronWithdrawExpireUnfreezeMemo,
      })
    ).toBe(false)
  })

  it('constructs a native WithdrawExpireUnfreezeContract for the owner', async () => {
    const ownerAddress = 'TClaimOwner'
    const keysignPayload = makeClaimPayload({ ownerAddress })

    const [input] = await getTronSigningInputs({
      keysignPayload,
      walletCore: {} as WalletCore,
    })

    expect(input.transaction?.withdrawExpireUnfreeze?.ownerAddress).toBe(
      ownerAddress
    )
    expect(input.transaction).toMatchInlineSnapshot(`
      {
        "blockHeader": {
          "number": "4",
          "parentHash": "ERERERERERERERERERERERERERERERERERERERERERE=",
          "timestamp": "3",
          "txTrieRoot": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
          "version": 0,
          "witnessAddress": "IiIiIiIiIiIiIiIiIiIiIiIiIiIi",
        },
        "expiration": "2",
        "feeLimit": "0",
        "timestamp": "1",
        "withdrawExpireUnfreeze": {
          "ownerAddress": "TClaimOwner",
        },
      }
    `)
    expect(input.transaction?.transfer).toBeNull()
    expect(input.transaction?.feeLimit?.toString()).toBe('0')
    expect(input.transaction?.memo ?? '').toBe('')
  })

  it('signs identical claim bytes for zero and display-only amounts', async () => {
    const ownerAddress = 'TClaimOwner'

    const [zeroAmount] = await getTronSigningInputs({
      keysignPayload: makeClaimPayload({ ownerAddress, toAmount: '0' }),
      walletCore: {} as WalletCore,
    })
    const [displayAmount] = await getTronSigningInputs({
      keysignPayload: makeClaimPayload({
        ownerAddress,
        toAmount: '12500000',
      }),
      walletCore: {} as WalletCore,
    })

    expect(displayAmount).toEqual(zeroAmount)
  })

  it('rejects a marker collision on a non-claim transfer payload', async () => {
    const ownerAddress = 'TClaimOwner'
    const keysignPayload = create(KeysignPayloadSchema, {
      coin: create(CoinSchema, {
        chain: 'Tron',
        ticker: 'TRX',
        address: ownerAddress,
        decimals: 6,
        isNativeToken: true,
      }),
      toAddress: 'TDifferentRecipient',
      toAmount: '1',
      memo: tronWithdrawExpireUnfreezeMemo,
      blockchainSpecific: {
        case: 'tronSpecific',
        value: create(TronSpecificSchema, {
          timestamp: 1n,
          expiration: 2n,
          blockHeaderTimestamp: 3n,
          blockHeaderNumber: 4n,
          blockHeaderVersion: 0n,
          blockHeaderTxTrieRoot: '00'.repeat(32),
          blockHeaderParentHash: '11'.repeat(32),
          blockHeaderWitnessAddress: '22'.repeat(21),
          gasEstimation: 999n,
        }),
      },
    })

    expect(() =>
      getTronSigningInputs({
        keysignPayload,
        walletCore: {} as WalletCore,
      })
    ).toThrow('Invalid TRON expired-unfreeze claim payload')
  })

  it.each([
    [
      'memo suffix',
      (payload: ReturnType<typeof makeClaimPayload>) => {
        payload.memo = `${tronWithdrawExpireUnfreezeMemo}:OTHER`
      },
    ],
    [
      'wrong chain',
      (payload: ReturnType<typeof makeClaimPayload>) => {
        payload.coin!.chain = 'Ethereum'
      },
    ],
    [
      'non-TRX ticker',
      (payload: ReturnType<typeof makeClaimPayload>) => {
        payload.coin!.ticker = 'USDT'
      },
    ],
    [
      'non-native coin',
      (payload: ReturnType<typeof makeClaimPayload>) => {
        payload.coin!.isNativeToken = false
      },
    ],
    [
      'token contract',
      (payload: ReturnType<typeof makeClaimPayload>) => {
        payload.coin!.contractAddress = 'TTokenContract'
      },
    ],
    [
      'decimal display amount',
      (payload: ReturnType<typeof makeClaimPayload>) => {
        payload.toAmount = '12.5'
      },
    ],
  ])('rejects %s in the published resolver', async (_label, invalidate) => {
    const keysignPayload = makeClaimPayload()
    invalidate(keysignPayload)

    expect(() =>
      getTronSigningInputs({
        keysignPayload,
        walletCore: {} as WalletCore,
      })
    ).toThrow('Invalid TRON expired-unfreeze claim payload')
  })
})
