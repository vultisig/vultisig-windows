import { areEqualCoins, CoinKey } from '@core/chain/coin/Coin';

import { chainFeeCoin } from '../chainFeeCoin';

export const isFeeCoin = (coin: CoinKey) =>
  areEqualCoins(coin, chainFeeCoin[coin.chain]);
