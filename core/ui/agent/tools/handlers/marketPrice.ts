import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { knownTokensIndex } from '@core/chain/coin/knownTokens/index'
import { getCoinPrices } from '@core/chain/coin/price/getCoinPrices'
import { fiatCurrencies, FiatCurrency } from '@core/config/FiatCurrency'

import { resolveAsset } from '../shared/assetResolution'
import type { ToolHandler } from '../types'

function resolvePriceProviderId(
  asset: string,
  coins: { ticker: string; priceProviderId?: string }[]
): string {
  const normalized = asset.trim().toLowerCase()

  const resolved = resolveAsset(normalized)
  if (resolved?.priceProviderId) return resolved.priceProviderId.toLowerCase()

  for (const chain of Object.values(Chain)) {
    const fc = chainFeeCoin[chain]
    if (fc.ticker.toLowerCase() === normalized && fc.priceProviderId) {
      return fc.priceProviderId.toLowerCase()
    }
  }

  for (const chain of Object.values(Chain)) {
    const tokens = knownTokensIndex[chain]
    if (!tokens) continue
    for (const token of Object.values(tokens)) {
      if (token.ticker.toLowerCase() === normalized && token.priceProviderId) {
        return token.priceProviderId.toLowerCase()
      }
    }
  }

  for (const coin of coins) {
    if (coin.ticker.toLowerCase() === normalized && coin.priceProviderId) {
      return coin.priceProviderId.toLowerCase()
    }
  }

  return normalized
}

function isFiatCurrency(s: string): s is FiatCurrency {
  return (fiatCurrencies as readonly string[]).includes(s)
}

export const handleMarketPrice: ToolHandler = async (input, context) => {
  const asset = String(input.asset ?? '').trim()
  if (!asset) throw new Error('asset is required')

  let fiat = 'usd'
  if (input.fiat) {
    fiat = String(input.fiat).trim().toLowerCase() || 'usd'
  }

  const priceProviderId = resolvePriceProviderId(asset, context.coins)
  const fiatCurrency = isFiatCurrency(fiat) ? fiat : ('usd' as FiatCurrency)

  const prices = await getCoinPrices({
    ids: [priceProviderId],
    fiatCurrency,
  })

  const price = prices[priceProviderId.toLowerCase()] ?? prices[priceProviderId]

  if (price === undefined) {
    return {
      data: {
        found: false,
        asset,
        price_provider_id: priceProviderId,
        fiat,
        message: `No market price available for '${asset}'`,
        source: 'api.vultisig.com/coingeicko/api/v3/simple/price',
      },
    }
  }

  return {
    data: {
      found: true,
      asset,
      price_provider_id: priceProviderId,
      fiat,
      price,
      source: 'api.vultisig.com/coingeicko/api/v3/simple/price',
      as_of: new Date().toISOString(),
    },
  }
}
