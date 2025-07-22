import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'

// @tony: This is a product requirement, as we need to add coins in a specific format that are not always available in the vault.
export const makeUnmergeSpecificPlaceholderCoin = (symbol: string): Coin => ({
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
