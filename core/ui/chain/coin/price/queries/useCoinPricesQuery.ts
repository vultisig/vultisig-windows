import { useCombineQueries } from '@lib/ui/query/hooks/useCombineQueries'
import { EagerQuery, Query } from '@lib/ui/query/Query'
import { persistQueryOptions } from '@lib/ui/query/utils/options'
import { useQueries } from '@tanstack/react-query'
import { Chain, CosmosChain, EvmChain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { fetchNavPerShare } from '@vultisig/core-chain/chains/cosmos/thor/yield-bearing-tokens/services/fetchNavPerShare'
import { yieldBearingThorChainTokens } from '@vultisig/core-chain/chains/cosmos/thor/yield-bearing-tokens/yAssetsOnThorChain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { CoinKey, coinKeyToString, Token } from '@vultisig/core-chain/coin/Coin'
import { getErc20Prices } from '@vultisig/core-chain/coin/price/evm/getErc20Prices'
import { getCoinPrices } from '@vultisig/core-chain/coin/price/getCoinPrices'
import { FiatCurrency } from '@vultisig/core-config/FiatCurrency'
import { groupItems } from '@vultisig/lib-utils/array/groupItems'
import { isEmpty } from '@vultisig/lib-utils/array/isEmpty'
import { without } from '@vultisig/lib-utils/array/without'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { NotImplementedError } from '@vultisig/lib-utils/error/NotImplementedError'
import { mergeRecords } from '@vultisig/lib-utils/record/mergeRecords'
import { toEntries } from '@vultisig/lib-utils/record/toEntries'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'

import { useFiatCurrency } from '../../../../storage/fiatCurrency'
import { getMayaPoolPrice } from '../maya/getMayaPoolPrice'
import {
  MayaPoolPricedTokenId,
  mayaPoolPricedTokens,
} from '../maya/mayaPoolPricedTokens'

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
  const staticUnsupportedResults: {
    data: Record<string, number> | undefined
    isPending: boolean
    error: unknown | null
  }[] = []

  const coinsWithPriceProviderId: (CoinKey & { priceProviderId: string })[] = []
  const erc20sWithoutPriceProviderId: Token<CoinKey<EvmChain>>[] = []
  const yieldBearingTokens: Token<CoinKey<CosmosChain>>[] = []
  const mayaPoolTokens: (Token<CoinKey> & {
    poolTokenId: MayaPoolPricedTokenId
  })[] = []

  coins.forEach(({ id, priceProviderId, chain }) => {
    if (
      chain === Chain.MayaChain &&
      id &&
      id.toLowerCase() in mayaPoolPricedTokens
    ) {
      mayaPoolTokens.push({
        id,
        chain,
        poolTokenId: id.toLowerCase() as MayaPoolPricedTokenId,
      })
    } else if (priceProviderId) {
      coinsWithPriceProviderId.push({ id, priceProviderId, chain })
    } else if (
      id &&
      id in yieldBearingThorChainTokens &&
      isChainOfKind(chain, 'cosmos')
    ) {
      yieldBearingTokens.push({ id, chain })
    } else if (isChainOfKind(chain, 'evm') && id) {
      erc20sWithoutPriceProviderId.push({ id, chain })
    } else if (!eager) {
      staticUnsupportedResults.push({
        data: undefined,
        isPending: false,
        error: new NotImplementedError(
          `price resolution for ${coinKeyToString({ id, chain })}`
        ),
      })
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
          const matchedCoins = coinsWithPriceProviderId.filter(coin =>
            areLowerCaseEqual(coin.priceProviderId, priceProviderId)
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

  if (!isEmpty(mayaPoolTokens)) {
    const cacaoPriceProviderId = shouldBePresent(
      chainFeeCoin[Chain.MayaChain].priceProviderId
    )

    queries.push({
      queryKey: [
        'mayaPoolPrices',
        mayaPoolTokens.map(c => c.poolTokenId),
        fiatCurrency,
      ],
      queryFn: async () => {
        const cacaoPrices = await getCoinPrices({
          ids: [cacaoPriceProviderId],
          fiatCurrency,
        })
        const cacaoPriceUsd = cacaoPrices[cacaoPriceProviderId]
        if (cacaoPriceUsd == null) return {}

        const result: Record<string, number> = {}

        const prices = await Promise.all(
          mayaPoolTokens.map(async coin => {
            const config = mayaPoolPricedTokens[coin.poolTokenId]
            const price = await getMayaPoolPrice({
              asset: config.poolAsset,
              assetDecimals: config.decimals,
              cacaoPriceUsd,
            })
            return { coin, price }
          })
        )

        for (const { coin, price } of prices) {
          if (price != null) {
            result[coinKeyToString(coin)] = price
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
    queries: [...queryResults, ...staticUnsupportedResults],
    joinData: data => {
      const merged = mergeRecords(...data)
      for (const coin of coins) {
        const key = coinKeyToString(coin)
        if (!(key in merged)) {
          merged[key] = 0
        }
      }
      return merged
    },
    eager,
  })
}
