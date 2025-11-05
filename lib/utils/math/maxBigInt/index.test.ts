import { describe, expect, it } from 'vitest'

import { maxBigInt } from '.'

describe('maxBigInt', () => {
  it('should return the largest value from a list of bigints', () => {
    expect(maxBigInt(10n, 20n, 5n, 15n)).toBe(20n)
    expect(maxBigInt(1n, 2n, 3n)).toBe(3n)
    expect(maxBigInt(100n, -50n, 0n, 30n)).toBe(100n)
  })

  it('should return the single bigint when only one is provided', () => {
    expect(maxBigInt(42n)).toBe(42n)
  })

  it('should throw an error when no arguments are provided', () => {
    expect(() => maxBigInt()).toThrowError('maxBigInt: No arguments provided')
  })

  it('should handle large bigints correctly', () => {
    const largeBigInt1 = BigInt('9223372036854775807')
    const largeBigInt2 = BigInt('-9223372036854775808')
    expect(maxBigInt(largeBigInt1, largeBigInt2)).toBe(largeBigInt1)
  })

  it('should handle identical bigints correctly', () => {
    expect(maxBigInt(5n, 5n, 5n)).toBe(5n)
  })

  it('should handle a mix of positive and negative bigints', () => {
    expect(maxBigInt(-10n, 5n, 15n, -20n)).toBe(15n)
  })
})
