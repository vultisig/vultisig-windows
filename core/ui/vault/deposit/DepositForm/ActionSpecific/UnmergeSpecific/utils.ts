import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

// @tony: This is a product requirement, as we need to add coins in a specific format that are not always available in the vault.
export const makeUnmergeSpecificPlaceholderCoin = (
  symbol: string,
  address: AccountCoin['address']
): AccountCoin => ({
  id: `4.${symbol}`,
  chain: Chain.THORChain,
  ticker: symbol,
  decimals: chainFeeCoin[Chain.THORChain].decimals,
  logo: symbol.toLowerCase(),
  address,
})

export const formatUnmergeShares = (shares: number) =>
  (shares / 1e8).toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  })
