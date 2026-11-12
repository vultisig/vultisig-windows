import { describe, expect, it } from 'vitest'

import {
  canNavigateToSendStep,
  getSendStepState,
  SendStepCompletion,
} from './sendSteps'

const nothingDone: SendStepCompletion = {
  coin: false,
  address: false,
  amount: false,
}

const coinDone: SendStepCompletion = { ...nothingDone, coin: true }

const coinAndAddressDone: SendStepCompletion = { ...coinDone, address: true }

describe('canNavigateToSendStep', () => {
  it('always allows going back to the asset step', () => {
    expect(
      canNavigateToSendStep({
        step: 'coin',
        current: 'amount',
        completion: nothingDone,
      })
    ).toBe(true)
  })

  it('allows the address step only once an asset is chosen', () => {
    expect(
      canNavigateToSendStep({
        step: 'address',
        current: 'coin',
        completion: nothingDone,
      })
    ).toBe(false)
    expect(
      canNavigateToSendStep({
        step: 'address',
        current: 'coin',
        completion: coinDone,
      })
    ).toBe(true)
  })

  it('allows the amount step only once the address is valid too', () => {
    expect(
      canNavigateToSendStep({
        step: 'amount',
        current: 'coin',
        completion: coinDone,
      })
    ).toBe(false)
    expect(
      canNavigateToSendStep({
        step: 'amount',
        current: 'address',
        completion: coinAndAddressDone,
      })
    ).toBe(true)
  })

  it('does nothing for the step already shown', () => {
    expect(
      canNavigateToSendStep({
        step: 'address',
        current: 'address',
        completion: coinAndAddressDone,
      })
    ).toBe(false)
  })
})

describe('getSendStepState', () => {
  it('marks the shown step active even when it is complete', () => {
    expect(
      getSendStepState({
        step: 'address',
        current: 'address',
        completion: coinAndAddressDone,
      })
    ).toBe('active')
  })

  it('marks other steps completed or upcoming by their own completion', () => {
    expect(
      getSendStepState({
        step: 'coin',
        current: 'amount',
        completion: coinAndAddressDone,
      })
    ).toBe('completed')
    expect(
      getSendStepState({
        step: 'amount',
        current: 'coin',
        completion: coinAndAddressDone,
      })
    ).toBe('upcoming')
  })
})
