import { describe, expect, it, vi } from 'vitest';

import { Chain } from '../../../model/chain';
import { TokensStore } from '../../../services/Coin/CoinList';
import { getChainPrimaryCoin } from '../getChainPrimaryCoin';

vi.mock('../../../services/Coin/CoinList', () => ({
  TokensStore: {
    TokenSelectionAssets: [
      {
        chain: Chain.Ethereum,
        isNativeToken: true,
        ticker: 'ETH',
        contractAddress: '',
        decimals: 18,
        logo: 'eth',
        priceProviderId: 'ethereum',
      },
      {
        chain: Chain.Ethereum,
        isNativeToken: false,
        ticker: 'USDT',
        contractAddress: '0x...',
        decimals: 6,
        logo: 'usdt',
        priceProviderId: 'tether',
      },
      {
        chain: Chain.BSC,
        isNativeToken: true,
        ticker: 'BNB',
        contractAddress: '',
        decimals: 18,
        logo: 'bsc',
        priceProviderId: 'binancecoin',
      },
      {
        chain: Chain.BSC,
        isNativeToken: false,
        ticker: 'BUSD',
        contractAddress: '0x...',
        decimals: 18,
        logo: 'busd',
        priceProviderId: 'binanceusd',
      },
      {
        chain: Chain.Solana,
        isNativeToken: true,
        ticker: 'SOL',
        contractAddress: '',
        decimals: 9,
        logo: 'solana',
        priceProviderId: 'solana',
      },
    ],
  },
}));

// Mock shouldBePresent
vi.mock('../../../lib/utils/assert/shouldBePresent', () => ({
  shouldBePresent: vi.fn(value => {
    if (!value) {
      throw new Error('value is required');
    }
    return value;
  }),
}));

describe('getChainPrimaryCoin', () => {
  it('should return the native token for Ethereum', () => {
    const result = getChainPrimaryCoin(Chain.Ethereum);
    expect(result).toEqual({
      chain: Chain.Ethereum,
      isNativeToken: true,
      ticker: 'ETH',
      contractAddress: '',
      decimals: 18,
      logo: 'eth',
      priceProviderId: 'ethereum',
    });
  });

  it('should return the native token for Binance Smart Chain (BSC)', () => {
    const result = getChainPrimaryCoin(Chain.BSC);
    expect(result).toEqual({
      chain: Chain.BSC,
      isNativeToken: true,
      ticker: 'BNB',
      contractAddress: '',
      decimals: 18,
      logo: 'bsc',
      priceProviderId: 'binancecoin',
    });
  });

  it('should return the native token for Solana', () => {
    const result = getChainPrimaryCoin(Chain.Solana);
    expect(result).toEqual({
      chain: Chain.Solana,
      isNativeToken: true,
      ticker: 'SOL',
      contractAddress: '',
      decimals: 9,
      logo: 'solana',
      priceProviderId: 'solana',
    });
  });

  it('should throw an error if no native token is found for the chain', () => {
    TokensStore.TokenSelectionAssets = TokensStore.TokenSelectionAssets.filter(
      token => token.chain !== Chain.Ethereum
    );

    expect(() => getChainPrimaryCoin(Chain.Ethereum)).toThrow(
      'value is required'
    );
  });

  it('should throw an error if the chain is not supported', () => {
    expect(() => getChainPrimaryCoin('UnsupportedChain' as Chain)).toThrow(
      'value is required'
    );
  });
});
