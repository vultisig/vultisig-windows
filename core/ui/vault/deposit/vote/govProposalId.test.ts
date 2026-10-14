import { describe, expect, it } from 'vitest'

import { parseGovProposalId } from './govProposalId'

describe('parseGovProposalId', () => {
  it.each([
    ['1', 1n],
    ['398', 398n],
    ['18446744073709551615', 18446744073709551615n],
  ])('accepts %s', (value, expected) => {
    expect(parseGovProposalId(value)).toBe(expected)
  })

  it.each([
    ['an empty string', ''],
    ['zero', '0'],
    ['a negative number', '-1'],
    ['a fraction', '1.5'],
    ['text', 'abc'],
    ['a value above uint64', '18446744073709551616'],
    ['a missing value', undefined],
  ])('rejects %s', (_, value) => {
    expect(() => parseGovProposalId(value)).toThrow()
  })
})
