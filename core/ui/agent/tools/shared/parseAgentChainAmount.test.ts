import { describe, expect, it } from 'vitest'

import { parseAgentChainAmount } from './parseAgentChainAmount'

describe('parseAgentChainAmount', () => {
  it('preserves exact decimal strings', () => {
    expect(
      parseAgentChainAmount({
        amount: '0.123456789123456789',
        decimals: 18,
      })
    ).toBe(123456789123456789n)
  })

  it.each(['', 'junk', 'NaN', 'Infinity', '-1', '0', '0.0000000000000000009'])(
    'rejects invalid or non-positive input %j',
    amount => {
      expect(() => parseAgentChainAmount({ amount, decimals: 18 })).toThrow(
        `Invalid amount: ${amount}`
      )
    }
  )

  it('allows zero only when the caller explicitly permits it', () => {
    expect(
      parseAgentChainAmount({ amount: '0', decimals: 18, allowZero: true })
    ).toBe(0n)
  })

  it.each(['-0', '-0.0000000000000000009', '-1e-19'])(
    'rejects negative lexical input before zero-allowed truncation: %j',
    amount => {
      expect(() =>
        parseAgentChainAmount({ amount, decimals: 18, allowZero: true })
      ).toThrow(`Invalid amount: ${amount}`)
    }
  )
})
