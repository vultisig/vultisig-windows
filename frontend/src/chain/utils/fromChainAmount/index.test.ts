import { describe, expect, it } from 'vitest';

import { fromChainAmount } from '../fromChainAmount';

describe('fromChainAmount', () => {
  it('should correctly convert a number amount with decimals', () => {
    const amount = 1234567890;
    const decimals = 8;
    const result = fromChainAmount(amount, decimals);
    expect(result).toBe(12.3456789);
  });

  it('should correctly convert a bigint amount with decimals', () => {
    const amount = BigInt(1234567890);
    const decimals = 8;
    const result = fromChainAmount(amount, decimals);
    expect(result).toBe(12.3456789);
  });

  it('should return the correct value when there are no decimals', () => {
    const amount = 1234567890;
    const decimals = 0;
    const result = fromChainAmount(amount, decimals);
    expect(result).toBe(1234567890);
  });

  it('should return 0 when the amount is 0', () => {
    const amount = 0;
    const decimals = 8;
    const result = fromChainAmount(amount, decimals);
    expect(result).toBe(0);
  });

  it('should handle large numbers without losing precision', () => {
    const amount = BigInt('1000000000000000000');
    const decimals = 18;
    const result = fromChainAmount(amount, decimals);
    expect(result).toBe(1);
  });

  it('should handle fractional values correctly', () => {
    const amount = 123;
    const decimals = 2;
    const result = fromChainAmount(amount, decimals);
    expect(result).toBe(1.23);
  });
});
