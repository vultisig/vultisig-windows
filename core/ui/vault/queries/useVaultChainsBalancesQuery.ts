import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useBalancesQuery } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { usePortfolioVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { EagerQuery } from '@lib/ui/query/Query'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  accountCoinKeyToString,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { getCoinValue } from '@vultisig/core-chain/coin/utils/getCoinValue'
import { groupItems } from '@vultisig/lib-utils/array/groupItems'
import { order } from '@vultisig/lib-utils/array/order'
import { sum } from '@vultisig/lib-utils/array/sum'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { recordMap } from '@vultisig/lib-utils/record/recordMap'
import { toEntries } from '@vultisig/lib-utils/record/toEntries'
import { useMemo } from 'react'

import { VaultChainCoin } from './useVaultChainCoinsQuery'

const chainRegistry = new Set<string>(Object.values(Chain))

const isKnownChain = (value: string): value is Chain => chainRegistry.has(value)

export type VaultChainBalance = {
  chain: Chain
  coins: VaultChainCoin[]
}

export const useVaultChainsBalancesQuery = (): EagerQuery<
  VaultChainBalance[]
> => {
  const coins = usePortfolioVaultCoins()

  const pricesQuery = useCoinPricesQuery({
    coins: coins,
  })

  const balancesQuery = useBalancesQuery(coins.map(extractAccountCoinKey))

  return useMemo(() => {
    const isPending = pricesQuery.isPending || balancesQuery.isPending

    const coinsWithKnownChain = coins.filter(
      (coin): coin is (typeof coins)[number] & { chain: Chain } =>
        isKnownChain(coin.chain)
    )

    const groupedCoins = groupItems(coinsWithKnownChain, coin => coin.chain)
    const unresolvedCoin = coinsWithKnownChain.find(coin => {
      const key = accountCoinKeyToString(extractAccountCoinKey(coin))
      return balancesQuery.data?.[key] === undefined
    })
    const errors = [...balancesQuery.errors, ...pricesQuery.errors]

    if (unresolvedCoin) {
      return {
        isPending,
        data: undefined,
        errors:
          errors.length > 0
            ? errors
            : isPending
              ? []
              : [
                  new Error(
                    `Failed to resolve ${unresolvedCoin.chain} balance`
                  ),
                ],
      }
    }

    const balancesByChain = recordMap(groupedCoins, chainCoins => {
      return chainCoins.map(coin => {
        const key = accountCoinKeyToString(extractAccountCoinKey(coin))
        const amount = shouldBePresent(balancesQuery.data?.[key])

        const price = pricesQuery?.data?.[coinKeyToString(coin)] ?? 0
        return {
          ...coin,
          amount,
          price,
        }
      })
    })

    const data = order(
      toEntries(balancesByChain).map(({ key, value }) => ({
        chain: key,
        coins: value,
      })),
      ({ coins }) => sum(coins.map(getCoinValue)),
      'desc'
    )

    return {
      isPending,
      data,
      errors,
    }
  }, [coins, pricesQuery, balancesQuery])
}
