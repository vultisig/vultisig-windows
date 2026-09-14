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
    expect(parseFiatInputValue('12.5')).toBe('12.5')
    expect(parseFiatInputValue('12.')).toBe('12.')
    expect(parseFiatInputValue('')).toBe('')
  })

  it('prefixes a leading dot with zero', () => {
    expect(parseFiatInputValue('.5')).toBe('0.5')
  })

  it('strips minus signs and rejects other characters', () => {
    expect(parseFiatInputValue('-12')).toBe('12')
    expect(parseFiatInputValue('1e3')).toBeUndefined()
    expect(parseFiatInputValue('1,000')).toBeUndefined()
    expect(parseFiatInputValue('1.2.3')).toBeUndefined()
  })
})
