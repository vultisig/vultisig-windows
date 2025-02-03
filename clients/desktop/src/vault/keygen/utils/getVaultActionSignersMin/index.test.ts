import { describe, expect, it } from 'vitest';

import { getVaultActionSignersMin } from '.';

describe('getVaultActionSignersMin', () => {
  it('should return 1 when signers is 1', () => {
    expect(getVaultActionSignersMin(1)).toBe(1);
  });

  it('should return the minimum number of signers required (2/3 of the input, rounded up)', () => {
    expect(getVaultActionSignersMin(2)).toBe(2);
    expect(getVaultActionSignersMin(3)).toBe(2);
    expect(getVaultActionSignersMin(4)).toBe(3);
    expect(getVaultActionSignersMin(6)).toBe(4);
  });

  it('should handle edge cases like 0 signers', () => {
    expect(getVaultActionSignersMin(0)).toBe(0);
  });

  it('should handle large numbers correctly', () => {
    expect(getVaultActionSignersMin(100)).toBe(67); // 100 * 2 / 3 = 66.66 → 67
  });
});
