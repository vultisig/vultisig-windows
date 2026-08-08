import { describe, expect, it } from 'vitest'

import { getTxSuccessAmountPresentation } from './getTxSuccessAmountPresentation'

describe('getTxSuccessAmountPresentation', () => {
  it('labels zero-amount skip-broadcast results as signed signatures', () => {
    expect(
      getTxSuccessAmountPresentation({
        amount: 0,
        skipBroadcast: true,
      })
    ).toEqual({
      actionLabel: 'signed_signature',
      hideZeroAmount: true,
    })
  })

  it('keeps parsed skip-broadcast amounts visible', () => {
    expect(
      getTxSuccessAmountPresentation({
        amount: 1.25,
        skipBroadcast: true,
      })
    ).toEqual({
      actionLabel: undefined,
      hideZeroAmount: false,
    })
  })

  it('preserves normal broadcast action labels', () => {
    expect(
      getTxSuccessAmountPresentation({
        amount: 0,
        txActionLabel: 'contract_execution',
      })
    ).toEqual({
      actionLabel: 'contract_execution',
      hideZeroAmount: false,
    })
  })

  it('preserves labeled zero-amount skip-broadcast results', () => {
    expect(
      getTxSuccessAmountPresentation({
        amount: 0,
        skipBroadcast: true,
        txActionLabel: 'deposited',
      })
    ).toEqual({
      actionLabel: 'deposited',
      hideZeroAmount: false,
    })
  })
})
