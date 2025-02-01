import { describe, expect, it } from 'vitest';

import { toChainAmount } from '../toChainAmount';

describe('toChainAmount', () => {
  it('should convert a number to a chain amount with given decimals', () => {
    const result = toChainAmount(1.23, 18);
    expect(result).toBe(BigInt('1230000000000000000'));
  });

  it('should handle zero amount correctly', () => {
    const result = toChainAmount(0, 18);
    expect(result).toBe(BigInt(0));
  });

  it('should handle very small amounts', () => {
    const result = toChainAmount(0.0000001, 18);
    expect(result).toBe(BigInt('100000000000'));
  });

  it('should handle large amounts', () => {
    const result = toChainAmount(123456.789, 6);
    expect(result).toBe(BigInt('123456789000'));
  });

  it('should round correctly for fractional values', () => {
    const result = toChainAmount(1.23456789, 2);
    expect(result).toBe(BigInt('123'));
  });

  it('should handle edge cases for decimals', () => {
    const result = toChainAmount(1.2345, 0);
    expect(result).toBe(BigInt(1));
  });
});
