import { describe, expect, it, vi } from 'vitest';

import { CoinKey } from '../../../coin/Coin';
import { EvmChain } from '../../../model/chain';
import { isNativeCoin } from '../isNativeCoin';

vi.mock('../../../services/Coin/CoinList', () => ({
  TokensStore: {
    TokenSelectionAssets: [
      {
        chain: EvmChain.Ethereum,
        isNativeToken: true,
        ticker: 'ETH',
        contractAddress: '',
      },
      {
        chain: EvmChain.BSC,
        isNativeToken: true,
        ticker: 'BNB',
        contractAddress: '',
      },
      {
        chain: EvmChain.Ethereum,
        isNativeToken: false,
        ticker: 'USDT',
        contractAddress: '0x1234',
      },
    ],
  },
}));

vi.mock('../../../coin/Coin', () => ({
  areEqualCoins: vi.fn(
    (one: CoinKey, another: CoinKey) =>
      one.chainId === another.chainId && one.id === another.id
  ),
}));

vi.mock('../../../coin/utils/coinMeta', () => ({
  getCoinMetaKey: vi.fn(
    ({ ticker, contractAddress, isNativeToken, chain }) => ({
      chainId: chain,
      id: isNativeToken ? ticker : contractAddress,
    })
  ),
}));

describe('isNativeCoin', () => {
  it('should return true for a native Ethereum coin (ETH)', () => {
    const key: CoinKey = { chainId: EvmChain.Ethereum, id: 'ETH' };
    expect(isNativeCoin(key)).toBe(true);
  });

  it('should return true for a native Binance Smart Chain coin (BNB)', () => {
    const key: CoinKey = { chainId: EvmChain.BSC, id: 'BNB' };
    expect(isNativeCoin(key)).toBe(true);
  });

  it('should return false for a non-native Ethereum token (USDT)', () => {
    const key: CoinKey = { chainId: EvmChain.Ethereum, id: '0x1234' };
    expect(isNativeCoin(key)).toBe(false);
  });

  it('should return false for an unsupported coin key', () => {
    const key: CoinKey = { chainId: EvmChain.Ethereum, id: 'Unsupported' };
    expect(isNativeCoin(key)).toBe(false);
  });
});
