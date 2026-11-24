import { describe, expect, it } from 'vitest'

import { getFiatInputValue, parseFiatInputValue } from './fiatInputValue'

describe('getFiatInputValue', () => {
  it('keeps two fraction digits and drops trailing zeros', () => {
    expect(getFiatInputValue(1116.28)).toBe('1116.28')
    expect(getFiatInputValue(1000)).toBe('1000')
    expect(getFiatInputValue(12.5)).toBe('12.5')
    expect(getFiatInputValue(0)).toBe('0')
  })

  it('rounds to the cent', () => {
    expect(getFiatInputValue(1.005)).toBe('1')
    expect(getFiatInputValue(1.999)).toBe('2')
  })

  it('keeps significant digits for sub-cent amounts', () => {
    expect(getFiatInputValue(0.004)).toBe('0.004')
    expect(getFiatInputValue(0.00000003)).toBe('0.00000003')
    expect(getFiatInputValue(0.00123)).toBe('0.0012')
  })
})

describe('parseFiatInputValue', () => {
  it('accepts digits and a single dot', () => {
    expect(parseFiatInputValue({ value: '12.5' })).toBe('12.5')
    expect(parseFiatInputValue({ value: '12.' })).toBe('12.')
    expect(parseFiatInputValue({ value: '' })).toBe('')
  })

  it('prefixes a leading dot with zero', () => {
    expect(parseFiatInputValue({ value: '.5' })).toBe('0.5')
  })

  it('strips minus signs and rejects other characters', () => {
    expect(parseFiatInputValue({ value: '-12' })).toBe('12')
    expect(parseFiatInputValue({ value: '1e3' })).toBeUndefined()
    expect(parseFiatInputValue({ value: '1.2.3' })).toBeUndefined()
  })

  it('reads a comma as the decimal separator (#5289)', () => {
    // Refusing it dropped the keystroke, so the next digit joined the
    // integer part and `1,5` became `15`.
    expect(parseFiatInputValue({ value: '1,5' })).toBe('1.5')
    expect(parseFiatInputValue({ value: '1,' })).toBe('1.')
    expect(parseFiatInputValue({ value: ',5' })).toBe('0.5')
  })

  it('never reads a typed separator as grouping', () => {
    expect(parseFiatInputValue({ value: '1,000' })).toBe('1.000')
    expect(parseFiatInputValue({ value: '1,234,5' })).toBeUndefined()
  })

  describe('a grouped-thousand paste is refused', () => {
    it.each(['1,000', '1,500', '12,345', ',000'])(
      'refuses %s on paste rather than meaning a thousandth as much',
      value => {
        expect(parseFiatInputValue({ value, source: 'paste' })).toBeUndefined()
      }
    )

    it.each([
      ['1,5', '1.5'],
      ['1,', '1.'],
      [',5', '0.5'],
      ['1,25', '1.25'],
      ['1.000', '1.000'],
    ])('still reads a pasted %s as %s', (value, expected) => {
      expect(parseFiatInputValue({ value, source: 'paste' })).toBe(expected)
    })
  })
})
