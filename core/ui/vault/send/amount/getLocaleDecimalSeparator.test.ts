import { describe, expect, it } from 'vitest'

import { getLocaleDecimalSeparator } from './getLocaleDecimalSeparator'

describe('getLocaleDecimalSeparator', () => {
  it.each([
    ['en-US', '.'],
    ['en-GB', '.'],
    ['de-DE', ','],
    ['fr-FR', ','],
    ['pt-BR', ','],
  ])('reads %s as %s', (locale, expected) => {
    expect(getLocaleDecimalSeparator(locale)).toBe(expected)
  })

  it('falls back to a dot for locales the amount inputs cannot parse', () => {
    expect(getLocaleDecimalSeparator('ar-EG')).toBe('.')
  })

  it('reads the runtime locale as a separator the inputs can parse', () => {
    expect(['.', ',']).toContain(getLocaleDecimalSeparator())
  })
})
