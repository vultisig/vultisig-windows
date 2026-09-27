import { EvmChain } from '@vultisig/core-chain/Chain'
import { CoinKey, coinKeyToString, Token } from '@vultisig/core-chain/coin/Coin'
import { getErc20Prices } from '@vultisig/core-chain/coin/price/evm/getErc20Prices'
import { FiatCurrency } from '@vultisig/core-config/FiatCurrency'
import { toBatches } from '@vultisig/lib-utils/array/toBatches'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { retry } from '@vultisig/lib-utils/query/retry'
import { isRecordEmpty } from '@vultisig/lib-utils/record/isRecordEmpty'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'

import { keptPriceMaxAge, StampedPrice } from './previousCoinPricesForFiat'

/** Matches the SDK contract-price batch. One failed URL must not blank the chain. */
export const erc20PriceBatchSize = 25

export const erc20PriceRetryDelayMs = 1_000

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
  previous: Record<string, StampedPrice>
  getPrices?: GetPrices
}): Promise<Record<string, StampedPrice>> {
  const batches = toBatches(coins, erc20PriceBatchSize)
  const freshPrices: Record<string, number> = {}
  const kept: Record<string, StampedPrice> = {}
  const now = Date.now()
  let failures = 0

  for (const batch of batches) {
    try {
      const prices = await retry({
        func: () =>
          getPrices({
            ids: batch.map(coin => shouldBePresent(coin.id)),
            chain,
            fiatCurrency,
          }),
        attempts: 1,
        delay: erc20PriceRetryDelayMs,
      })
      for (const [id, price] of Object.entries(prices)) {
        const coin = shouldBePresent(
          batch.find(candidate =>
            areLowerCaseEqual(shouldBePresent(candidate.id), id)
          )
        )
        freshPrices[coinKeyToString(coin)] = price
      }
    } catch {
      failures += 1
      for (const coin of batch) {
        const key = coinKeyToString(coin)
        const prior = previous[key]
        if (prior && now - prior.fetchedAt <= keptPriceMaxAge) kept[key] = prior
      }
    }
  }

  if (
    batches.length > 0 &&
    failures === batches.length &&
    isRecordEmpty(kept)
  ) {
    throw new Error('every contract price batch failed')
  }

  const fetchedAt = Date.now()
  const fresh: Record<string, StampedPrice> = {}
  for (const [key, price] of Object.entries(freshPrices)) {
    fresh[key] = { price, fetchedAt }
  }
  return { ...kept, ...fresh }
}
