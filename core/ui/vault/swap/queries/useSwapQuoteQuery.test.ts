import { describe, expect, it } from 'vitest'

import {
  getDebouncedSwapQuoteAmount,
  shouldDebouncedSwapQuoteAmountShowPending,
} from './useSwapQuoteQuery'

describe('shouldDebouncedSwapQuoteAmountShowPending', () => {
  it('shows pending while a positive amount waits for debounce', () => {
    expect(
      shouldDebouncedSwapQuoteAmountShowPending({
        fromAmount: 12n,
        debouncedFromAmount: 1n,
      })
    ).toBe(true)
  })

  it('does not show pending when the debounced amount caught up', () => {
    expect(
      shouldDebouncedSwapQuoteAmountShowPending({
        fromAmount: 12n,
        debouncedFromAmount: 12n,
      })
    ).toBe(false)
  })

  it('does not show pending for empty or zero amounts', () => {
    expect(
      shouldDebouncedSwapQuoteAmountShowPending({
        fromAmount: null,
        debouncedFromAmount: 12n,
      })
    ).toBe(false)

    expect(
      shouldDebouncedSwapQuoteAmountShowPending({
        fromAmount: 0n,
        debouncedFromAmount: 12n,
      })
    ).toBe(false)
  })
})

describe('getDebouncedSwapQuoteAmount', () => {
  it('returns the amount once debounce has caught up', () => {
    expect(
      getDebouncedSwapQuoteAmount({
        fromAmount: 12n,
        debouncedFromAmount: 12n,
      })
    ).toBe(12n)
  })

  it('withholds the amount while debounce is pending', () => {
    expect(
      getDebouncedSwapQuoteAmount({
        fromAmount: 12n,
        debouncedFromAmount: 1n,
      })
    ).toBeUndefined()
  })

  it('does not keep the stale debounced amount after clearing or zeroing input', () => {
    expect(
      getDebouncedSwapQuoteAmount({
        fromAmount: null,
        debouncedFromAmount: 12n,
      })
    ).toBeUndefined()

    expect(
      getDebouncedSwapQuoteAmount({
        fromAmount: 0n,
        debouncedFromAmount: 12n,
      })
    ).toBeUndefined()
  })
})
