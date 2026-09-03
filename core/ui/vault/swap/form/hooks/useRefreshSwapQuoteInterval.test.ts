import { describe, expect, it } from 'vitest'

import { getDisplayedSwapQuoteCountdown } from './useRefreshSwapQuoteInterval'

const now = 1_000_000

describe('getDisplayedSwapQuoteCountdown', () => {
  it('shows the refresh interval while the quote outlives it', () => {
    expect(
      getDisplayedSwapQuoteCountdown({
        timeLeft: 60,
        expiresAt: now + 300_000,
        now,
      })
    ).toBe(60)
  })

  it('counts the interval down normally', () => {
    expect(
      getDisplayedSwapQuoteCountdown({
        timeLeft: 42,
        expiresAt: now + 300_000,
        now,
      })
    ).toBe(42)
  })

  it('shows the quote validity once it is shorter than the interval', () => {
    expect(
      getDisplayedSwapQuoteCountdown({
        timeLeft: 60,
        expiresAt: now + 20_000,
        now,
      })
    ).toBe(20)
  })

  it('shows zero for an expired quote rather than a full interval', () => {
    expect(
      getDisplayedSwapQuoteCountdown({
        timeLeft: 60,
        expiresAt: now - 5_000,
        now,
      })
    ).toBe(0)
  })

  it('falls back to the interval when the quote carries no expiry', () => {
    expect(
      getDisplayedSwapQuoteCountdown({
        timeLeft: 60,
        expiresAt: undefined,
        now,
      })
    ).toBe(60)
  })
})
