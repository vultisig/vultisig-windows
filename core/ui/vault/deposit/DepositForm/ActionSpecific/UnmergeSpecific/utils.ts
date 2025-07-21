import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'

export const makePlaceholderCoin = (symbol: string): Coin => ({
  id: `4.${symbol}`,
  chain: Chain.THORChain,
  ticker: symbol,
  decimals: chainFeeCoin[Chain.THORChain].decimals,
  logo: symbol.toLowerCase(),
})

export const formatUnmergeShares = (shares: number) =>
  (shares / 1e8).toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  })
