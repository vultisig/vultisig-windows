import { describe, expect, it } from 'vitest';

import { groupItems } from '@lib/utils/array/groupItems';
import { Chain } from '../../../model/chain';
import { ChainEntity } from '../../ChainEntity';
import { groupChainEntities } from '../groupChainEntities';

describe('groupItems', () => {
  it('should group items by a key derived from the getKey function', () => {
    const items = [
      { id: 1, category: 'A' },
      { id: 2, category: 'B' },
      { id: 3, category: 'A' },
      { id: 4, category: 'C' },
    ];

    const grouped = groupItems(items, item => item.category);

    expect(grouped).toEqual({
      A: [
        { id: 1, category: 'A' },
        { id: 3, category: 'A' },
      ],
      B: [{ id: 2, category: 'B' }],
      C: [{ id: 4, category: 'C' }],
    });
  });

  it('should return an empty object if the input array is empty', () => {
    const items: { id: number; category: string }[] = [];
    const grouped = groupItems(items, item => item.category);

    expect(grouped).toEqual({});
  });

  it('should handle items with the same key', () => {
    const items = [
      { id: 1, group: 1 },
      { id: 2, group: 1 },
      { id: 3, group: 2 },
    ];

    const grouped = groupItems(items, item => item.group);

    expect(grouped).toEqual({
      1: [
        { id: 1, group: 1 },
        { id: 2, group: 1 },
      ],
      2: [{ id: 3, group: 2 }],
    });
  });

  it('should handle items with numeric keys', () => {
    const items = [
      { id: 1, key: 10 },
      { id: 2, key: 20 },
      { id: 3, key: 10 },
    ];

    const grouped = groupItems(items, item => item.key);

    expect(grouped).toEqual({
      10: [
        { id: 1, key: 10 },
        { id: 3, key: 10 },
      ],
      20: [{ id: 2, key: 20 }],
    });
  });
});

describe('groupChainEntities', () => {
  it('should group chain entities by chain', () => {
    const chainEntities: ChainEntity[] = [
      { chain: 'Ethereum' as Chain },
      { chain: 'BSC' as Chain },
      { chain: 'Ethereum' as Chain },
      { chain: 'Solana' as Chain },
    ];

    const grouped = groupChainEntities(chainEntities);

    expect(grouped).toEqual({
      Ethereum: [{ chain: 'Ethereum' }, { chain: 'Ethereum' }],
      BSC: [{ chain: 'BSC' }],
      Solana: [{ chain: 'Solana' }],
    });
  });

  it('should return an empty object if no chain entities are provided', () => {
    const chainEntities: ChainEntity[] = [];
    const grouped = groupChainEntities(chainEntities);

    expect(grouped).toEqual({});
  });

  it('should handle chain entities with the same chain', () => {
    const chainEntities: ChainEntity[] = [
      { chain: 'Ethereum' as Chain },
      { chain: 'Ethereum' as Chain },
    ];

    const grouped = groupChainEntities(chainEntities);

    expect(grouped).toEqual({
      Ethereum: [{ chain: 'Ethereum' }, { chain: 'Ethereum' }],
    });
  });
});
