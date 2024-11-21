import { describe, expect, it } from 'vitest';

import { Chain } from '../../../model/chain';
import { getBlockExplorerUrl } from '../getBlockExplorerUrl';

describe('getBlockExplorerUrl', () => {
  const address = '0x1234567890abcdef';
  const tx = '0xabcdef1234567890';

  it('should throw an error for unsupported chains', () => {
    expect(() =>
      getBlockExplorerUrl({
        chainId: 'UnsupportedChain' as Chain,
        entity: 'address',
        value: address,
      })
    ).toThrow(TypeError);
  });

  it('should throw an error for unsupported entities', () => {
    expect(() =>
      getBlockExplorerUrl({
        chainId: Chain.Ethereum,
        entity: 'unsupported-entity' as 'address' | 'tx',
        value: address,
      })
    ).toThrow(TypeError);
  });

  it('should generate the correct address URL for Ethereum', () => {
    const url = getBlockExplorerUrl({
      chainId: Chain.Ethereum,
      entity: 'address',
      value: address,
    });
    expect(url).toBe(`https://etherscan.io/address/${address}`);
  });

  it('should generate the correct transaction URL for Ethereum', () => {
    const url = getBlockExplorerUrl({
      chainId: Chain.Ethereum,
      entity: 'tx',
      value: tx,
    });
    expect(url).toBe(`https://etherscan.io/tx/${tx}`);
  });

  it('should generate the correct address URL for Bitcoin', () => {
    const url = getBlockExplorerUrl({
      chainId: Chain.Bitcoin,
      entity: 'address',
      value: address,
    });
    expect(url).toBe(`https://mempool.space/address/${address}`);
  });

  it('should generate the correct transaction URL for Bitcoin', () => {
    const url = getBlockExplorerUrl({
      chainId: Chain.Bitcoin,
      entity: 'tx',
      value: tx,
    });
    expect(url).toBe(`https://mempool.space/tx/${tx}`);
  });

  it('should generate the correct address URL for Solana', () => {
    const url = getBlockExplorerUrl({
      chainId: Chain.Solana,
      entity: 'address',
      value: address,
    });
    expect(url).toBe(`https://explorer.solana.com/address/${address}`);
  });

  it('should generate the correct transaction URL for Solana', () => {
    const url = getBlockExplorerUrl({
      chainId: Chain.Solana,
      entity: 'tx',
      value: tx,
    });
    expect(url).toBe(`https://explorer.solana.com/tx/${tx}`);
  });
});
