import { Coin } from '@core/communication/vultisig/keysign/v1/coin_pb';
import { isOneOf } from '@lib/utils/array/isOneOf';

import { Chain } from './chain';

export type CoinMeta = {
  chain: Chain;
  ticker: string;
  logo: string;
  decimals: number;
  contractAddress: string;
  isNativeToken: boolean;
  priceProviderId: string;
};

export namespace CoinMeta {
  export function fromCoin(coin: Coin): CoinMeta {
    if (!coin) {
      throw new Error('Coin is undefined');
    }

    const chain = isOneOf(coin.chain, Object.values(Chain));
    if (!chain) {
      throw new Error('Chain is undefined');
    }

    const coinMeta: CoinMeta = {
      chain: chain,
      contractAddress: coin.contractAddress,
      decimals: coin.decimals,
      isNativeToken: coin.isNativeToken,
      logo: coin.logo,
      priceProviderId: coin.priceProviderId,
      ticker: coin.ticker,
    };

    return coinMeta;
  }

  export function sortedStringify(obj: any): string {
    const ordered: any = {};
    Object.keys(obj)
      .sort()
      .forEach(key => {
        ordered[key] = obj[key];
      });
    return JSON.stringify(ordered);
  }

  export function compareCoins(
    storedCoin: CoinMeta,
    targetCoin: CoinMeta
  ): boolean {
    // Use the sortedStringify method to ensure that the objects are compared in a consistent order
    const storedCoinString = sortedStringify(storedCoin);
    const targetCoinString = sortedStringify(targetCoin);

    //console.log('Stored Coin:', storedCoinString);
    //console.log('Target Coin:', targetCoinString);

    return storedCoinString === targetCoinString;
  }
}
