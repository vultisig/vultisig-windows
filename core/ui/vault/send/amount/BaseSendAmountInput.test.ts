import { describe, expect, it } from 'vitest'

import { parseSendAmountInput } from './BaseSendAmountInput'

const dot = { decimalSeparator: '.' } as const
const comma = { decimalSeparator: ',' } as const

describe('parseSendAmountInput', () => {
  it('keeps every digit of a full-precision 18-decimal amount', () => {
    expect(
      parseSendAmountInput({
        value: '6.123456789012345678',
        decimals: 18,
        ...dot,
      })
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
      ...dot,
    })

    expect(parsed?.chainAmount).toBe(6649999999999999991n)
    expect(parsed?.chainAmount).not.toBe(6650000000000000000n)
  })

  it('strips minus signs and pads a leading dot', () => {
    expect(parseSendAmountInput({ value: '-5', decimals: 6, ...dot })).toEqual({
      normalized: '5',
      chainAmount: 5000000n,
    })
    expect(parseSendAmountInput({ value: '.5', decimals: 6, ...dot })).toEqual({
      normalized: '0.5',
      chainAmount: 500000n,
    })
  })

  it('returns null for a cleared input', () => {
    expect(parseSendAmountInput({ value: '', decimals: 18, ...dot })).toBeNull()
    expect(
      parseSendAmountInput({ value: '-', decimals: 18, ...dot })
    ).toBeNull()
  })

  it.each([
    'abc',
    '1.2.3',
    '1e5',
    '1,5',
    '1,000',
    '1,2,3',
    '1,234.56',
    '1.234,56',
  ])('rejects invalid input %s where the locale writes a dot', value => {
    expect(
      parseSendAmountInput({ value, decimals: 18, ...dot })
    ).toBeUndefined()
  })

  it.each(['1.2.3', '1,2,3', '1,234.56', '1.234,56'])(
    'rejects mixed or repeated separators where the locale writes a comma %s',
    value => {
      expect(
        parseSendAmountInput({ value, decimals: 18, ...comma })
      ).toBeUndefined()
    }
  )

  it('reads a single comma as the decimal point where the locale writes one', () => {
    expect(
      parseSendAmountInput({ value: '1,5', decimals: 6, ...comma })
    ).toEqual({
      normalized: '1.5',
      chainAmount: 1_500_000n,
    })
    expect(
      parseSendAmountInput({ value: ',5', decimals: 6, ...comma })
    ).toEqual(parseSendAmountInput({ value: '.5', decimals: 6, ...comma }))
  })

  it.each([dot, comma])('accepts a lone dot decimal (%o)', separator => {
    expect(
      parseSendAmountInput({ value: '1.5', decimals: 6, ...separator })
    ).toEqual({
      normalized: '1.5',
      chainAmount: 1_500_000n,
    })
  })

  it('rejects more fraction digits than the coin supports', () => {
    expect(
      parseSendAmountInput({ value: '1.1234567', decimals: 6, ...dot })
    ).toBeUndefined()
  })
})
