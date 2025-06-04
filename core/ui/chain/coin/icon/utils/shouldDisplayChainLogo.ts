import { EthereumL2Chain } from '@core/chain/Chain'
import { CoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { isOneOf } from '@lib/utils/array/isOneOf'

export const shouldDisplayChainLogo = (coin: CoinKey): boolean =>
  isOneOf(coin.chain, Object.values(EthereumL2Chain)) || !isFeeCoin(coin)
