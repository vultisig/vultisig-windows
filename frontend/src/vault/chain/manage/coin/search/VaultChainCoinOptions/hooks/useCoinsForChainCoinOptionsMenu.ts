import { useMemo } from 'react';

import { storage } from '../../../../../../../../wailsjs/go/models';
import { chainFeeCoin } from '../../../../../../../coin/chainFeeCoin';
import { chainTokens } from '../../../../../../../coin/chainTokens';
import { storageCoinToCoin } from '../../../../../../../coin/utils/storageCoin';
import { Chain } from '../../../../../../../model/chain';
import { CoinMeta } from '../../../../../../../model/coin-meta';
import {
  PersistentStateKey,
  usePersistentState,
} from '../../../../../../../state/persistentState';
import { useCurrentVaultChainCoins } from '../../../../../../state/currentVault';

export function splitCoinsIntoSelectedAndUnselected(
  coins: CoinMeta[],
  vaultCoins: storage.Coin[]
): { selectedCoins: CoinMeta[]; unselectedCoins: CoinMeta[] } {
  const vaultCoinTickers = new Set(vaultCoins.map(coin => coin.ticker));
  const selectedCoins: CoinMeta[] = [];
  const unselectedCoins: CoinMeta[] = [];
  const seenSelected = new Set<string>();
  const seenUnselected = new Set<string>();

  for (const coin of coins) {
    if (coin.isNativeToken) {
      continue;
    }

    const { ticker } = coin;
    const isSelected = vaultCoinTickers.has(ticker);

    if (isSelected) {
      if (!seenSelected.has(ticker)) {
        selectedCoins.push(coin);
        seenSelected.add(ticker);
      }
    } else {
      if (!seenUnselected.has(ticker)) {
        unselectedCoins.push(coin);
        seenUnselected.add(ticker);
      }
    }
  }

  return { selectedCoins, unselectedCoins };
}

export const useCoinsForChainCoinOptionsMenu = (chain: Chain) => {
  const [chainToCoinsMap] = usePersistentState<Record<string, storage.Coin[]>>(
    PersistentStateKey.ChainAllTokens,
    {}
  );

  const vaultCoins = useCurrentVaultChainCoins(chain);

  const storedCoins = useMemo(
    () =>
      chainToCoinsMap[chain]
        ? chainToCoinsMap[chain].map(coin =>
            CoinMeta.fromCoin(storageCoinToCoin(coin))
          )
        : ([] as CoinMeta[]),
    [chain, chainToCoinsMap]
  );

  const coins = [
    ...storedCoins,
    chainFeeCoin[chain],
    ...(chainTokens[chain] ?? []),
  ];
  return splitCoinsIntoSelectedAndUnselected(coins, vaultCoins);
};
