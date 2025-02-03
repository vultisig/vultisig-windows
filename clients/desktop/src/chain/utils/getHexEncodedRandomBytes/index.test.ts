import { describe, expect, it, vi } from 'vitest';

import { getHexEncodedRandomBytes } from '../getHexEncodedRandomBytes';

vi.mock('crypto', () => ({
  randomBytes: vi.fn((length: number) => Buffer.alloc(length, 0x56)),
}));

describe('getHexEncodedRandomBytes', () => {
  it('should generate a hex-encoded string of the specified length in bytes', () => {
    const length = 4;
    const result = getHexEncodedRandomBytes(length);

    expect(result).toHaveLength(8);
  });

  it('should generate different values for multiple calls (when not mocked)', () => {
    vi.unmock('crypto');

    const result1 = getHexEncodedRandomBytes(4);
    const result2 = getHexEncodedRandomBytes(4);

    expect(result1).not.toBe(result2);
  });

  it('should handle a length of 0 bytes', () => {
    const result = getHexEncodedRandomBytes(0);
    expect(result).toBe('');
  });

  it('should throw an error for negative lengths', () => {
    expect(() => getHexEncodedRandomBytes(-1)).toThrow(
      'Length must be a non-negative integer'
    );
  });

  it('should throw an error for non-integer lengths', () => {
    expect(() => getHexEncodedRandomBytes(4.5)).toThrow(
      'Length must be a non-negative integer'
    );
  });
});
