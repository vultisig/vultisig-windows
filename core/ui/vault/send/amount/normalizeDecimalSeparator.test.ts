import { describe, expect, it } from 'vitest'

import {
  DecimalSeparator,
  normalizeDecimalSeparator,
} from './normalizeDecimalSeparator'

const cases: [DecimalSeparator, string, string | undefined][] = [
  [',', '1,5', '1.5'],
  [',', '1,000', '1.000'],
  [',', '1.5', '1.5'],
  [',', '1,234.56', undefined],
  [',', '1.234,56', undefined],
  [',', ',5', '.5'],
  [',', '1,2,3', undefined],
  ['.', '1,5', undefined],
  ['.', '1,000', undefined],
  ['.', '1.5', '1.5'],
  ['.', '1,234.56', undefined],
  ['.', '1.234,56', undefined],
  ['.', ',5', undefined],
  ['.', '1,2,3', undefined],
]

describe('normalizeDecimalSeparator', () => {
  it.each(cases)(
    'with a "%s" locale reads %s as %s',
    (decimalSeparator, text, expected) => {
      expect(normalizeDecimalSeparator({ text, decimalSeparator })).toBe(
        expected
      )
    }
  )

  it.each<DecimalSeparator>([',', '.'])(
    'with a "%s" locale refuses repeated dots',
    decimalSeparator => {
      expect(
        normalizeDecimalSeparator({ text: '1.2.3', decimalSeparator })
      ).toBeUndefined()
    }
  )
})
