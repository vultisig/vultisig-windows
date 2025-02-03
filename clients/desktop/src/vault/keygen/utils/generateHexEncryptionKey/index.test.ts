import { describe, expect, it, vi } from 'vitest';

import * as utils from '../../../../chain/utils/getHexEncodedRandomBytes';
import { generateHexEncryptionKey } from '.';

describe('generateHexEncryptionKey', () => {
  it('should return a 64-character hex string', () => {
    const hexKey = generateHexEncryptionKey();
    expect(typeof hexKey).toBe('string');
    expect(hexKey.length).toBe(64);
    expect(hexKey).toMatch(/^[a-f0-9]+$/i);
  });

  it('should call getHexEncodedRandomBytes with 32', () => {
    const spy = vi.spyOn(utils, 'getHexEncodedRandomBytes');
    generateHexEncryptionKey();
    expect(spy).toHaveBeenCalledWith(32);
    spy.mockRestore();
  });
});
