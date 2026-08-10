import { describe, expect, it } from 'vitest'

import { toIssuedCurrencyTicker } from './toIssuedCurrencyTicker'

describe('toIssuedCurrencyTicker', () => {
  it('decodes a non-standard currency to the ticker people recognise', () => {
    // Without this the review screen and history label the token
    // `534F4C4F00…` instead of SOLO.
    expect(
      toIssuedCurrencyTicker('534F4C4F00000000000000000000000000000000')
    ).toBe('SOLO')
  })

  it('decodes regardless of hex casing', () => {
    expect(
      toIssuedCurrencyTicker('534f4c4f00000000000000000000000000000000')
    ).toBe('SOLO')
  })

  it('leaves a standard 3-character code alone', () => {
    expect(toIssuedCurrencyTicker('USD')).toBe('USD')
  })

  it('leaves an already-readable ticker alone', () => {
    expect(toIssuedCurrencyTicker('RLUSD')).toBe('RLUSD')
  })

  it('keeps a code that does not decode to printable ASCII as-is', () => {
    // A 160-bit code that is not an encoded ticker should be shown as what it
    // is, not dressed up as one.
    const binary = 'FF01020300000000000000000000000000000000'

    expect(toIssuedCurrencyTicker(binary)).toBe(binary)
  })
})
