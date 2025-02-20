import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { areEqualCoins, CoinKey } from '@core/chain/coin/Coin'

export const isFeeCoin = (coin: CoinKey) =>
  areEqualCoins(coin, chainFeeCoin[coin.chain])
