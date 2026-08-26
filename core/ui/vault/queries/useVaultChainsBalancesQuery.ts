import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useBalancesQuery } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { usePortfolioVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { EagerQuery } from '@lib/ui/query/Query'
import { Chain } from '@vultisig/core-chain/Chain'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'

import {
  resolveVaultChainsBalances,
  VaultChainsBalances,
} from './resolveVaultChainsBalances'

const chainRegistry = new Set<string>(Object.values(Chain))

const isKnownChain = (value: string): value is Chain => chainRegistry.has(value)

/**
 * Portfolio balances of the current vault resolved per chain. `data` stays
 * undefined while any chain is still loading or when every chain failed; a
 * failed read on one chain otherwise only lands in `failedChains` and never
 * hides the chains that resolved.
 */
export const useVaultChainsBalancesQuery =
  (): EagerQuery<VaultChainsBalances> => {
    const coins = usePortfolioVaultCoins()

    const pricesQuery = useCoinPricesQuery({
      coins,
    })

    const balancesQuery = useBalancesQuery(coins.map(extractAccountCoinKey))

    const isPending = pricesQuery.isPending || balancesQuery.isPending
    const errors = [...balancesQuery.errors, ...pricesQuery.errors]

    const data = resolveVaultChainsBalances({
      coins: coins.filter(
        (coin): coin is (typeof coins)[number] & { chain: Chain } =>
          isKnownChain(coin.chain)
      ),
      balances: balancesQuery.data,
      prices: pricesQuery.data,
      isBalancesPending: balancesQuery.isPending,
    })

    if (data && data.balances.length === 0 && data.failedChains.length > 0) {
      return {
        isPending,
        data: undefined,
        errors:
          errors.length > 0
            ? errors
            : data.failedChains.map(
                chain => new Error(`Failed to resolve ${chain} balance`)
              ),
      }
    }

    return {
      isPending,
      data,
      errors,
    }
  }
