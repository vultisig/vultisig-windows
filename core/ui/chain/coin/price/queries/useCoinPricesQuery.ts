import { CosmosChain, EvmChain } from '@core/chain/Chain'
import { isChainOfKind } from '@core/chain/ChainKind'
import { fetchNavPerShare } from '@core/chain/chains/cosmos/thor/yield-bearing-tokens/services/fetchNavPerShare'
import { yieldBearingThorChainTokens } from '@core/chain/chains/cosmos/thor/yield-bearing-tokens/yAssetsOnThorChain'
import { CoinKey, coinKeyToString, Token } from '@core/chain/coin/Coin'
import { getErc20Prices } from '@core/chain/coin/price/evm/getErc20Prices'
import { getCoinPrices } from '@core/chain/coin/price/getCoinPrices'
import { FiatCurrency } from '@core/config/FiatCurrency'
import { useCombineQueries } from '@lib/ui/query/hooks/useCombineQueries'
import { EagerQuery, Query } from '@lib/ui/query/Query'
import { persistQueryOptions } from '@lib/ui/query/utils/options'
import { groupItems } from '@lib/utils/array/groupItems'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { without } from '@lib/utils/array/without'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { mergeRecords } from '@lib/utils/record/mergeRecords'
import { toEntries } from '@lib/utils/record/toEntries'
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual'
import { useQueries } from '@tanstack/react-query'

import { useFiatCurrency } from '../../../../storage/fiatCurrency'

type GetCoinPricesQueryKeysInput = {
  coins: CoinKey[]
  fiatCurrency: FiatCurrency
}

export const getCoinPricesQueryKeys = (input: GetCoinPricesQueryKeysInput) => [
  'coinPrices',
  input,
]

type UseCoinPricesQueryInput = {
  coins: (CoinKey & { priceProviderId?: string })[]
  fiatCurrency?: FiatCurrency
  eager?: boolean
}

export function useCoinPricesQuery(
  input: Omit<UseCoinPricesQueryInput, 'eager'> & { eager?: true }
): EagerQuery<Record<string, number>>
export function useCoinPricesQuery(
  input: Omit<UseCoinPricesQueryInput, 'eager'> & { eager: false }
): Query<Record<string, number>>
export function useCoinPricesQuery(
  input: UseCoinPricesQueryInput
): EagerQuery<Record<string, number>> | Query<Record<string, number>> {
  const defaultFiatCurrency = useFiatCurrency()

  const { eager = true, fiatCurrency = defaultFiatCurrency, coins } = input

  const queries = []

  const coinsWithPriceProviderId: (CoinKey & { priceProviderId: string })[] = []
  const erc20sWithoutPriceProviderId: Token<CoinKey<EvmChain>>[] = []
  const yieldBearingTokens: Token<CoinKey<CosmosChain>>[] = []

  coins.forEach(({ id, priceProviderId, chain }) => {
    if (priceProviderId) {
      coinsWithPriceProviderId.push({ id, priceProviderId, chain })
    } else if (
      id &&
      id in yieldBearingThorChainTokens &&
      isChainOfKind(chain, 'cosmos')
    ) {
      yieldBearingTokens.push({ id, chain })
    } else if (isChainOfKind(chain, 'evm') && id) {
      erc20sWithoutPriceProviderId.push({ id, chain })
    }
  })

  if (!isEmpty(erc20sWithoutPriceProviderId)) {
    const groupedByChain = groupItems(
      erc20sWithoutPriceProviderId,
      coin => coin.chain
    )

    toEntries(groupedByChain).forEach(({ key: chain, value: coins }) => {
      queries.push({
        queryKey: getCoinPricesQueryKeys({
          coins,
          fiatCurrency,
        }),
        queryFn: async () => {
          const prices = await getErc20Prices({
            ids: coins.map(({ id }) => id),
            chain,
            fiatCurrency,
          })

          const result: Record<string, number> = {}

          Object.entries(prices).forEach(([id, price]) => {
            const coin = shouldBePresent(
              coins.find(coin =>
                areLowerCaseEqual(shouldBePresent(coin.id), id)
              )
            )

            result[coinKeyToString(coin)] = price
          })

          return result
        },
        ...persistQueryOptions,
      })
    })
  }

  if (!isEmpty(coinsWithPriceProviderId)) {
    queries.push({
      queryKey: getCoinPricesQueryKeys({
        coins: coinsWithPriceProviderId,
        fiatCurrency,
      }),
      queryFn: async () => {
        const prices = await getCoinPrices({
          ids: without(
            coinsWithPriceProviderId.map(coin => coin.priceProviderId),
            undefined
          ),
          fiatCurrency,
        })

        const result: Record<string, number> = {}

        Object.entries(prices).forEach(([priceProviderId, price]) => {
          // multiple coins can have the same price provider
          // so we need to find all coins with the same price provider
          // for example: ETH.ETH, ARBITRUM.ETH, OPTIMISM.ETH there are all ETH , so they have the same price provider
          const matchedCoins = shouldBePresent(
            coinsWithPriceProviderId.filter(
              coin => coin.priceProviderId == priceProviderId
            )
          )
          matchedCoins.forEach(coin => {
            result[coinKeyToString(coin)] = price
          })
        })

        return result
      },
      ...persistQueryOptions,
    })
  }

  if (!isEmpty(yieldBearingTokens)) {
    const yieldBearingTokensIds = yieldBearingTokens.map(c => c.id)

    queries.push({
      queryKey: ['yieldNavPrices', yieldBearingTokensIds],
      queryFn: async () => {
        const navPairs = await Promise.all(
          yieldBearingTokensIds.map(
            async id => [id, await fetchNavPerShare(id)] as const
          )
        )

        const result: Record<string, number> = {}

        for (const [id, nav] of navPairs) {
          if (nav == null) continue
          const matched = yieldBearingTokens.filter(c =>
            areLowerCaseEqual(shouldBePresent(c.id), id)
          )

          for (const coin of matched) {
            result[coinKeyToString(coin)] = nav
          }
        }
        return result
      },
      ...persistQueryOptions,
    })
  }

  const queryResults = useQueries({
    queries,
  })

  return useCombineQueries({
    queries: queryResults,
    joinData: data => mergeRecords(...data),
    eager,
  })
}
