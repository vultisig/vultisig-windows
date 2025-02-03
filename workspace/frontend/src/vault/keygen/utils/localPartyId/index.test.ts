import { capitalizeFirstLetter } from '@lib/utils/capitalizeFirstLetter';
import { randomIntegerInRange } from '@lib/utils/randomInRange';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  formatKeygenDeviceName,
  generateLocalPartyId,
  getKeygenDeviceType,
  keygenDeviceFromDeviceName,
  parseLocalPartyId,
} from '.';

vi.mock('@lib/utils/capitalizeFirstLetter', () => ({
  capitalizeFirstLetter: vi.fn(
    str => str.charAt(0).toUpperCase() + str.slice(1)
  ),
}));

vi.mock('@lib/utils/randomIntegerInRange', () => ({
  randomIntegerInRange: vi.fn(() => 123),
}));

describe('Keygen Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateLocalPartyId', () => {
    it('generates local party ID for a default device', () => {
      const result = generateLocalPartyId();
      expect(result).toBe('windows-123');
    });

    it('generates local party ID for the "server" device', () => {
      (randomIntegerInRange as any).mockReturnValue(4567);
      const result = generateLocalPartyId('server');
      expect(result).toBe('Server-4567'); // Capitalized
      expect(capitalizeFirstLetter).toHaveBeenCalledWith('server');
    });

    it('uses random integer within the expected range', () => {
      generateLocalPartyId('linux');
      expect(randomIntegerInRange).toHaveBeenCalledWith(100, 999);
    });
  });

  describe('parseLocalPartyId', () => {
    it('parses a valid local party ID', () => {
      const result = parseLocalPartyId('windows-123');
      expect(result).toEqual({ deviceName: 'windows', hash: '123' });
    });

    it('handles unexpected formats gracefully', () => {
      const result = parseLocalPartyId('invalid');
      expect(result).toEqual({ deviceName: 'invalid', hash: undefined });
    });
  });

  describe('keygenDeviceFromDeviceName', () => {
    it('returns a valid KeygenDevice when device name matches', () => {
      const result = keygenDeviceFromDeviceName('windows');
      expect(result).toBe('windows');
    });

    it('returns null for unknown device names', () => {
      const result = keygenDeviceFromDeviceName('unknown');
      expect(result).toBeNull();
    });
  });

  describe('formatKeygenDeviceName', () => {
    it('formats known device names', () => {
      const result = formatKeygenDeviceName('windows');
      expect(result).toBe('Windows');
    });

    it('returns the original device name for unknown inputs', () => {
      const result = formatKeygenDeviceName('unknown');
      expect(result).toBe('unknown');
    });
  });

  describe('getKeygenDeviceType', () => {
    it('returns the correct device type for a known device', () => {
      const result = getKeygenDeviceType('iphone');
      expect(result).toBe('phone');
    });

    it('defaults to "phone" for unknown devices', () => {
      const result = getKeygenDeviceType('unknown');
      expect(result).toBe('phone');
    });
  });
});
