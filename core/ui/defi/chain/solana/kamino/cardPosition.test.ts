import { describe, expect, it } from 'vitest'

import { cardPosition } from './cardPosition'

describe('cardPosition', () => {
  it('never reports an unread balance as an empty vault', () => {
    // The one wrong answer here is telling a depositor they hold nothing, and
    // a zero is indistinguishable from unread until the query settles.
    expect(
      cardPosition({ tokenAmount: 0, isPending: true, hasFailed: false })
    ).toEqual({ status: 'pending' })

    expect(
      cardPosition({ tokenAmount: 0, isPending: false, hasFailed: true })
    ).toEqual({ status: 'unavailable' })
  })

  it('reports a settled empty vault as empty', () => {
    expect(
      cardPosition({ tokenAmount: 0, isPending: false, hasFailed: false })
    ).toEqual({ status: 'settled', tokenAmount: 0, pnlToken: undefined })
  })

  it('carries the balance and PnL once the read settles', () => {
    expect(
      cardPosition({
        tokenAmount: 0.21463057,
        pnlToken: 0.00002136,
        isPending: false,
        hasFailed: false,
      })
    ).toEqual({
      status: 'settled',
      tokenAmount: 0.21463057,
      pnlToken: 0.00002136,
    })
  })

  it('prefers pending over failed while a refetch is in flight', () => {
    expect(
      cardPosition({ tokenAmount: 0, isPending: true, hasFailed: true })
    ).toEqual({ status: 'pending' })
  })
})
