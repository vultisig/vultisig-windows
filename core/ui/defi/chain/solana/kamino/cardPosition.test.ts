import { kaminoShareAmount } from '@vultisig/core-chain/chains/solana/kamino/amount'
import { describe, expect, it } from 'vitest'

import { cardPosition } from './cardPosition'

// One token per share at 6 decimals each, so share base units read as USDC.
const vault = {
  tokensPerShare: { numerator: 1n, scale: 0 },
  tokenDecimals: 6,
  isPending: false,
  hasFailed: false,
}

const holding = (shareBaseUnits: bigint, pnlToken?: string) => ({
  shares: kaminoShareAmount(shareBaseUnits, 6),
  pnlToken,
})

describe('cardPosition', () => {
  it('never reports an unread balance as an empty vault', () => {
    // The one wrong answer here is telling a depositor they hold nothing, and
    // a zero is indistinguishable from unread until the query settles.
    expect(cardPosition({ ...vault, isPending: true })).toEqual({
      status: 'pending',
    })

    expect(cardPosition({ ...vault, hasFailed: true })).toEqual({
      status: 'unavailable',
    })
  })

  it('reports a settled empty vault as empty', () => {
    expect(cardPosition(vault)).toEqual({ status: 'settled', tokenAmount: 0 })
  })

  it('reports shares that cannot be valued as unavailable, not empty', () => {
    // An empty vault hides Withdraw; a position of unknown size must keep it.
    expect(
      cardPosition({
        ...vault,
        tokenDecimals: 19,
        holding: holding(5_000_000n, '0.1'),
      })
    ).toEqual({ status: 'unavailable' })
  })

  it('splits the current value into what was deposited and what it earned', () => {
    // The value already contains the interest, so labelling it "Deposited"
    // beside "Earned" counted the interest twice.
    expect(
      cardPosition({ ...vault, holding: holding(199_943_661n, '0.502044') })
    ).toEqual({
      status: 'settled',
      tokenAmount: 199.943661,
      breakdown: { deposited: 199.441617, pnl: 0.502044 },
    })
  })

  it('adds a loss back onto the value to recover the deposit', () => {
    expect(
      cardPosition({ ...vault, holding: holding(97_000_000n, '-3') })
    ).toEqual({
      status: 'settled',
      tokenAmount: 97,
      breakdown: { deposited: 100, pnl: -3 },
    })
  })

  it('subtracts PnL reported below the mint scale exactly, truncating toward zero', () => {
    // 1.000000 − 0.0000004 = 0.9999996, which truncates to 0.999999 USDC.
    expect(
      cardPosition({ ...vault, holding: holding(1_000_000n, '0.0000004') })
    ).toEqual({
      status: 'settled',
      tokenAmount: 1,
      breakdown: { deposited: 0.999999, pnl: 0.0000004 },
    })
  })

  it('claims no deposit when the PnL could not be read', () => {
    // Without the PnL the deposit is unknown; showing the value under the
    // "Deposited" label is the double count this guards against.
    for (const pnlToken of [undefined, '1,000.5']) {
      expect(
        cardPosition({ ...vault, holding: holding(5_240_045n, pnlToken) })
      ).toEqual({ status: 'settled', tokenAmount: 5.240045 })
    }
  })

  it('prefers pending over failed while a refetch is in flight', () => {
    expect(
      cardPosition({ ...vault, isPending: true, hasFailed: true })
    ).toEqual({ status: 'pending' })
  })
})
