import { describe, expect, it } from 'vitest';

import { getChainEntityIconSrc } from '../getChainEntityIconSrc';

describe('getChainEntityIconSrc', () => {
  it('should return the correct icon path for a valid chain name', () => {
    const name = 'Ethereum';
    const result = getChainEntityIconSrc(name);
    expect(result).toBe('/assets/icons/coins/ethereum.svg');
  });

  it('should handle uppercase chain names correctly', () => {
    const name = 'BITCOIN';
    const result = getChainEntityIconSrc(name);
    expect(result).toBe('/assets/icons/coins/bitcoin.svg');
  });

  it('should handle mixed-case chain names correctly', () => {
    const name = 'PolkaDot';
    const result = getChainEntityIconSrc(name);
    expect(result).toBe('/assets/icons/coins/polkadot.svg');
  });

  it('should return a valid path for an empty name', () => {
    const name = '';
    const result = getChainEntityIconSrc(name);
    expect(result).toBe('/assets/icons/coins/.svg');
  });

  it('should handle special characters in the name', () => {
    const name = 'Chain-123!';
    const result = getChainEntityIconSrc(name);
    expect(result).toBe('/assets/icons/coins/chain-123!.svg');
  });

  it('should handle names with spaces correctly', () => {
    const name = 'My Chain';
    const result = getChainEntityIconSrc(name);
    expect(result).toBe('/assets/icons/coins/my chain.svg');
  });
});
