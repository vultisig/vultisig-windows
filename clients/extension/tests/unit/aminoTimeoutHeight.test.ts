import { parseAminoTimeoutHeight } from '@clients/extension/src/inpage/providers/cosmos/aminoTimeoutHeight'
import { describe, expect, it } from 'vitest'

describe('parseAminoTimeoutHeight', () => {
  it.each([
    [undefined, undefined],
    ['0', '0'],
    ['33737015', '33737015'],
    ['18446744073709551615', '18446744073709551615'],
  ])('accepts %s', (value, expected) => {
    expect(parseAminoTimeoutHeight(value)).toBe(expected)
  })

  it.each([
    '',
    '-1',
    '1.5',
    '0x10',
    ' 1',
    '033737015',
    '18446744073709551616',
    33737015,
    ['33737015'],
    null,
  ])('refuses to sign over %j', value => {
    expect(() => parseAminoTimeoutHeight(value)).toThrow('timeout_height')
  })
})
