import { CoinKey } from '@core/chain/coin/Coin'

export const isFeeCoin = (coin: CoinKey) => !coin.id
