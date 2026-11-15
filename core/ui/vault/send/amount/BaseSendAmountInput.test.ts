import { describe, expect, it } from 'vitest'

import { parseSendAmountInput } from './BaseSendAmountInput'

describe('parseSendAmountInput', () => {
  it('keeps every digit of a full-precision 18-decimal amount', () => {
    expect(
      parseSendAmountInput({ value: '6.123456789012345678', decimals: 18 })
    ).toEqual({
      normalized: '6.123456789012345678',
      chainAmount: 6123456789012345678n,
    })
  })

  it('does not round up amounts whose nearest float64 is larger', () => {
    // parseFloat('6.649999999999999991') is exactly 6.65 — the old float64
    // path signed more than the user typed (#4488)
    const parsed = parseSendAmountInput({
      value: '6.649999999999999991',
      decimals: 18,
    })

    expect(parsed?.chainAmount).toBe(6649999999999999991n)
    expect(parsed?.chainAmount).not.toBe(6650000000000000000n)
  })

  it('strips minus signs and pads a leading dot', () => {
    expect(parseSendAmountInput({ value: '-5', decimals: 6 })).toEqual({
      normalized: '5',
      chainAmount: 5000000n,
    })
    expect(parseSendAmountInput({ value: '.5', decimals: 6 })).toEqual({
      normalized: '0.5',
      chainAmount: 500000n,
    })
  })

  it('returns null for a cleared input', () => {
    expect(parseSendAmountInput({ value: '', decimals: 18 })).toBeNull()
    expect(parseSendAmountInput({ value: '-', decimals: 18 })).toBeNull()
  })

  it.each(['abc', '1.2.3', '1e5'])('rejects invalid input %s', value => {
    expect(parseSendAmountInput({ value, decimals: 18 })).toBeUndefined()
  })

  it('rejects more fraction digits than the coin supports', () => {
    expect(
      parseSendAmountInput({ value: '1.1234567', decimals: 6 })
    ).toBeUndefined()
  })

  describe('a comma is the decimal point (#5289)', () => {
    it('parses a comma as the decimal point', () => {
      // Refusing it dropped the keystroke, so the next digit joined the
      // integer part and `1,5` was sent as `15`.
      expect(parseSendAmountInput({ value: '1,5', decimals: 6 })).toEqual({
        normalized: '1.5',
        chainAmount: 1500000n,
      })
    })

    it('accepts a trailing comma so the next digit lands in the fraction', () => {
      expect(parseSendAmountInput({ value: '1,', decimals: 6 })).toEqual({
        normalized: '1.',
        chainAmount: 1000000n,
      })
    })

    it('pads a leading comma', () => {
      expect(parseSendAmountInput({ value: ',5', decimals: 6 })).toEqual({
        normalized: '0.5',
        chainAmount: 500000n,
      })
    })

    it.each(['1,,', '1,.', '1.,', '1,234,5', '1,2.3'])(
      'rejects %s rather than reading a separator as grouping',
      value => {
        expect(parseSendAmountInput({ value, decimals: 6 })).toBeUndefined()
      }
    )

    it('never reads a comma as grouping', () => {
      expect(parseSendAmountInput({ value: '1,500', decimals: 6 })).toEqual({
        normalized: '1.500',
        chainAmount: 1500000n,
      })
    })
  })
})
