import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'
import type { TFunction } from 'i18next'
import { describe, expect, it } from 'vitest'

import { positiveAmountSchema } from './validationHelpers'

const t = ((key: string) => key) as TFunction

describe('positiveAmountSchema', () => {
  it('keeps a full-precision amount exact through validation', () => {
    const parsed = positiveAmountSchema(10, t).parse('6.123456789012345678')

    expect(toChainAmount(parsed, 18)).toBe(6123456789012345678n)
  })

  it('does not round the amount up past what the user entered', () => {
    // Number('6.649999999999999991') is exactly 6.65 — a float64 parse
    // would submit more than the user typed (#4494)
    const parsed = positiveAmountSchema(10, t).parse('6.649999999999999991')

    expect(toChainAmount(parsed, 18)).toBe(6649999999999999991n)
  })

  it('rejects zero, negative, and above-max amounts', () => {
    const schema = positiveAmountSchema(10, t)

    expect(schema.safeParse('0').success).toBe(false)
    expect(schema.safeParse('-1').success).toBe(false)
    expect(schema.safeParse('11').success).toBe(false)
    expect(schema.safeParse('9.99').success).toBe(true)
  })

  it('compares the max in exact base units when chainAmountMax is provided', () => {
    // Balance of 2^53 + 1 base units — beyond float64, where a float compare
    // cannot tell the true balance and balance + 1 unit apart
    const schema = positiveAmountSchema(90071992.54740992, t, undefined, {
      units: 9007199254740993n,
      decimals: 8,
    })

    expect(schema.safeParse('90071992.54740993').success).toBe(true)
    expect(schema.safeParse('90071992.54740994').success).toBe(false)
  })
})
