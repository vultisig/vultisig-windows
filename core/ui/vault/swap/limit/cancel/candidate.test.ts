import { Chain } from '@vultisig/core-chain/Chain'
import { getLimitSwapCancelEligibility } from '@vultisig/core-chain/swap/native/limitSwapCancelEligibility'
import { describe, expect, it } from 'vitest'

import { LimitSwapTransactionData } from '../../../../transaction-history/core'
import { toLimitSwapCancelCandidate } from './candidate'

const usdcContract = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

/**
 * As the queue reports it, and as this SDK derives it from the coin's own
 * contract — the two are byte-identical on purpose, so the cross-check between
 * them cannot fail on a spelling difference.
 */
const fullUsdc = `ETH.USDC-${usdcContract.toUpperCase()}`

const runeToUsdc: LimitSwapTransactionData = {
  fromAddress: 'thor1sender',
  fromToken: 'RUNE',
  fromTokenLogo: 'rune',
  fromChain: Chain.THORChain,
  fromDecimals: 8,
  fromAmount: '100000000',
  buyTicker: 'USDC',
  targetAsset: 'ETH.USDC-06EB48',
  minimumReceived: '0.43079145',
  destinationAddress: '0x14F6Ed6CBb27b607b0E2A48551A988F1a19c89B6',
  expiryHours: 24,
  memo: '=<:ETH.USDC-06EB48:0x14F6Ed6CBb27b607b0E2A48551A988F1a19c89B6:43079145/14400/0:v0:50',
  orderStatus: 'resting',
}

describe('toLimitSwapCancelCandidate', () => {
  it('reads the order identity a cancel addresses', () => {
    expect(toLimitSwapCancelCandidate(runeToUsdc)).toMatchObject({
      isTerminal: false,
      hasPendingCancel: false,
      sourceAsset: 'THOR.RUNE',
      signedSourceAsset: 'THOR.RUNE',
      targetAsset: 'ETH.USDC-06EB48',
      signedSourceAmount: 100_000_000n,
      signedTradeTarget: 43_079_145n,
    })
  })

  // Without this, every order placed before the signed fields existed would be
  // permanently uncancellable — despite the record holding exactly what a cancel
  // needs, in the memo it already stored.
  it('derives both amounts when the record predates them being captured', () => {
    const candidate = toLimitSwapCancelCandidate(runeToUsdc)

    expect(candidate.signedSourceAmount).toBe(100_000_000n)
    expect(candidate.signedTradeTarget).toBe(43_079_145n)
  })

  it('prefers the amounts recorded at signing over the derived ones', () => {
    const candidate = toLimitSwapCancelCandidate({
      ...runeToUsdc,
      signedSourceAmount: '90000000',
      signedTradeTarget: '40000000',
    })

    expect(candidate.signedSourceAmount).toBe(90_000_000n)
    expect(candidate.signedTradeTarget).toBe(40_000_000n)
  })

  // An 18-decimal source signs in wei; THORChain holds 1e8. The unrescaled value
  // would disagree with every queue observation and block the cancel outright.
  it("rescales an 18-decimal source into THORChain's fixed point", () => {
    const candidate = toLimitSwapCancelCandidate({
      ...runeToUsdc,
      fromToken: 'ETH',
      fromChain: Chain.Ethereum,
      fromDecimals: 18,
      fromAmount: (10n ** 18n).toString(),
    })

    expect(candidate.signedSourceAmount).toBe(100_000_000n)
    expect(candidate.sourceAsset).toBe('ETH.ETH')
  })

  // The placement spelling abbreviates a contract; a cancel memo skips the fuzzy
  // matching that would expand it again, so the two have to travel separately.
  it('supplies the abbreviated and full spellings of a token source separately', () => {
    const candidate = toLimitSwapCancelCandidate({
      ...runeToUsdc,
      fromToken: 'USDC',
      fromChain: Chain.Ethereum,
      fromTokenId: usdcContract,
      fromDecimals: 6,
      fromAmount: '1000000',
    })

    expect(candidate.sourceAsset).toBe('ETH.USDC-06EB48')
    expect(candidate.signedSourceAsset).toBe(fullUsdc)
  })

  it('carries the queue observations across for the cross-check', () => {
    const candidate = toLimitSwapCancelCandidate({
      ...runeToUsdc,
      deposit: '100000000',
      observedSourceAsset: 'THOR.RUNE',
      observedTargetAsset: fullUsdc,
      observedTradeTarget: '43079145',
    })

    expect(candidate).toMatchObject({
      observedDeposit: 100_000_000n,
      observedSourceAsset: 'THOR.RUNE',
      observedTargetAsset: fullUsdc,
      observedTradeTarget: 43_079_145n,
    })
  })

  it('reports a broadcast cancellation as pending', () => {
    expect(
      toLimitSwapCancelCandidate({ ...runeToUsdc, cancelTxHash: '0xabc' })
    ).toMatchObject({ hasPendingCancel: true })
  })

  it.each(['filled', 'refunded', 'expired', 'cancelled', 'rejected'] as const)(
    'reports a %s order as terminal',
    orderStatus => {
      expect(
        toLimitSwapCancelCandidate({ ...runeToUsdc, orderStatus })
      ).toMatchObject({ isTerminal: true })
    }
  )
})

// The candidate exists to be fed to the SDK, so what matters is the verdict it
// produces — not the shape in isolation.
describe('eligibility of a mapped record', () => {
  it('cancels a token target once the queue has reported its full spelling', () => {
    const eligibility = getLimitSwapCancelEligibility(
      toLimitSwapCancelCandidate({
        ...runeToUsdc,
        observedTargetAsset: fullUsdc,
      })
    )

    expect(eligibility).toEqual({
      cancellable: {
        sourceAsset: 'THOR.RUNE',
        sourceAmount: 100_000_000n,
        targetAsset: fullUsdc,
        tradeTarget: 43_079_145n,
      },
    })
  })

  // The abbreviation is unusable and nothing else supplies the contract yet, so
  // the action must not be offered rather than build a memo matching no order.
  it('blocks a token target that the queue has not reported yet', () => {
    expect(
      getLimitSwapCancelEligibility(toLimitSwapCancelCandidate(runeToUsdc))
    ).toEqual({ blocked: 'missingSignedData' })
  })

  it('cancels a native pair with no queue observation at all', () => {
    const eligibility = getLimitSwapCancelEligibility(
      toLimitSwapCancelCandidate({
        ...runeToUsdc,
        buyTicker: 'BTC',
        targetAsset: 'BTC.BTC',
        memo: '=<:BTC.BTC:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh:43079145/14400/0',
        destinationAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      })
    )

    expect(eligibility).toMatchObject({
      cancellable: { sourceAsset: 'THOR.RUNE', targetAsset: 'BTC.BTC' },
    })
  })

  it('blocks when the queue disagrees with what was signed', () => {
    expect(
      getLimitSwapCancelEligibility(
        toLimitSwapCancelCandidate({
          ...runeToUsdc,
          observedTargetAsset: fullUsdc,
          deposit: '99999999',
        })
      )
    ).toEqual({ blocked: 'signedDataDisagreesWithChain' })
  })

  it('blocks a cancellation that has already been broadcast', () => {
    expect(
      getLimitSwapCancelEligibility(
        toLimitSwapCancelCandidate({
          ...runeToUsdc,
          observedTargetAsset: fullUsdc,
          cancelTxHash: '0xabc',
        })
      )
    ).toEqual({ blocked: 'cancelAlreadyBroadcast' })
  })

  // Two full-contract assets plus two exact amounts overflow OP_RETURN, and
  // nothing in a cancel memo can be shortened. Such orders refund at expiry.
  it('blocks a token target from a UTXO source', () => {
    expect(
      getLimitSwapCancelEligibility(
        toLimitSwapCancelCandidate({
          ...runeToUsdc,
          fromAddress: 'bc1sender',
          fromToken: 'BTC',
          fromChain: Chain.Bitcoin,
          observedTargetAsset: fullUsdc,
        })
      )
    ).toEqual({ blocked: 'memoTooLongForSourceChain' })
  })
})

// The whole ERC20 route hinges on this: the derived spelling must be one the
// eligibility check can size against its source chain, and must match what the
// queue reports. Lower-cased, it is neither, and every token-funded order
// becomes uncancellable.
describe('an ERC20-funded order', () => {
  it('resolves against the queue and stays routable', () => {
    const eligibility = getLimitSwapCancelEligibility(
      toLimitSwapCancelCandidate({
        ...runeToUsdc,
        fromToken: 'USDC',
        fromChain: Chain.Ethereum,
        fromTokenId: usdcContract,
        fromDecimals: 6,
        fromAmount: '1000000',
        observedSourceAsset: fullUsdc,
        observedTargetAsset: fullUsdc,
      })
    )

    expect(eligibility).toMatchObject({
      cancellable: { sourceAsset: fullUsdc },
    })
  })
})
