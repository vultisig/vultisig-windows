import { EvmChain } from '@vultisig/core-chain/Chain'
import { CoinKey, coinKeyToString, Token } from '@vultisig/core-chain/coin/Coin'
import { getErc20Prices } from '@vultisig/core-chain/coin/price/evm/getErc20Prices'
import { FiatCurrency } from '@vultisig/core-config/FiatCurrency'
import { toBatches } from '@vultisig/lib-utils/array/toBatches'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'

/** Matches the SDK contract-price batch. One failed URL must not blank the chain. */
export const erc20PriceBatchSize = 25

type PricedCoin = Token<CoinKey<EvmChain>>

type GetPrices = (input: {
  ids: string[]
  chain: EvmChain
  fiatCurrency: FiatCurrency
}) => Promise<Record<string, number>>

/** A failed batch keeps its previous prices. A success that omits a contract drops it. */
export async function fetchErc20PricesKeepingFailedChunks({
  coins,
  chain,
  fiatCurrency,
  previous,
  getPrices = getErc20Prices,
}: {
  coins: PricedCoin[]
  chain: EvmChain
  fiatCurrency: FiatCurrency
  previous: Record<string, number>
  getPrices?: GetPrices
}): Promise<Record<string, number>> {
  const batches = toBatches(coins, erc20PriceBatchSize)
  const fresh: Record<string, number> = {}
  const failedKeys = new Set<string>()
  let failures = 0

  for (const batch of batches) {
    try {
      const prices = await attemptTwice(() =>
        getPrices({
          ids: batch.map(coin => shouldBePresent(coin.id)),
          chain,
          fiatCurrency,
        }),
      )
      for (const [id, price] of Object.entries(prices)) {
        const coin = shouldBePresent(
          batch.find(candidate =>
            areLowerCaseEqual(shouldBePresent(candidate.id), id),
          ),
        )
        fresh[coinKeyToString(coin)] = price
      }
    } catch {
      failures += 1
      for (const coin of batch) {
        const key = coinKeyToString(coin)
        if (key in previous) failedKeys.add(key)
      }
    }
  }

  if (batches.length > 0 && failures === batches.length) {
    throw new Error('every contract price batch failed')
  }

  const kept: Record<string, number> = {}
  for (const key of failedKeys) {
    kept[key] = previous[key]
  }
  return { ...kept, ...fresh }
}

async function attemptTwice<T>(fetchPrices: () => Promise<T>): Promise<T> {
  try {
    return await fetchPrices()
  } catch {
    return fetchPrices()
  }
}
