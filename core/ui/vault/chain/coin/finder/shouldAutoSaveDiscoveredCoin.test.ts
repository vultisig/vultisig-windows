import { describe, expect, it } from 'vitest'

import { shouldAutoSaveDiscoveredCoin } from './shouldAutoSaveDiscoveredCoin'

describe('shouldAutoSaveDiscoveredCoin', () => {
  it('keeps ordinary discovered coins auto-saveable', () => {
    expect(shouldAutoSaveDiscoveredCoin({ ticker: 'USTC' })).toBe(true)
  })

  it('does not auto-save hidden discoveries into the visible coin list', () => {
    expect(
      shouldAutoSaveDiscoveredCoin({ ticker: 'SPAM', isHidden: true })
    ).toBe(false)
  })
})
