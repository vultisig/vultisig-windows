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
 * Portfolio balances of the current vault resolved per chain. `data` is
 * undefined only while no chain has resolved yet: pending when some chain is
 * still loading, failed when every chain failed. Once any chain resolved, the
 * others are reported as loading or failed alongside it and a failed read
 * never hides the chains that resolved — not even while it is being retried.
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
      failedCoins: balancesQuery.failedCoins,
    })

    if (data.balances.length === 0 && data.loadingChains.length > 0) {
      return { isPending: true, data: undefined, errors }
    }

    if (data.balances.length === 0 && data.failedChains.length > 0) {
      return {
        isPending: false,
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
