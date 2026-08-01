import { describe, expect, it } from 'vitest'

import { getDeeplinkSendAmount } from './getDeeplinkSendAmount'

describe('getDeeplinkSendAmount', () => {
  it('keeps every digit of a full-precision 18-decimal amount', () => {
    expect(
      getDeeplinkSendAmount({ amount: '6.123456789012345678', decimals: 18 })
    ).toBe(6123456789012345678n)
  })

  it('does not round up amounts whose nearest float64 is larger', () => {
    // Number('6.649999999999999991') is exactly 6.65 — a float64 path would
    // pre-fill more than the deeplink specified (#4491)
    expect(
      getDeeplinkSendAmount({ amount: '6.649999999999999991', decimals: 18 })
    ).toBe(6649999999999999991n)
  })

  it('converts plain amounts', () => {
    expect(getDeeplinkSendAmount({ amount: '1.5', decimals: 8 })).toBe(
      150000000n
    )
    expect(getDeeplinkSendAmount({ amount: '100', decimals: 6 })).toBe(
      100000000n
    )
  })
})
