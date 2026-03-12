import { Chain } from '@core/chain/Chain'
import { getCoinBalance } from '@core/chain/coin/balance'
import { getCoinPrices } from '@core/chain/coin/price/getCoinPrices'
import { attempt, withFallback } from '@lib/utils/attempt'

import type { ToolHandler } from '../types'

function formatBalance(raw: bigint, decimals: number): number {
  if (raw === 0n) return 0
  const divisor = 10n ** BigInt(decimals)
  const whole = Number(raw / divisor)
  const remainder = Number(raw % divisor)
  return whole + remainder / Math.pow(10, decimals)
}

export const handleGetPortfolio: ToolHandler = async (_input, context) => {
  const priceProviderIds = context.coins
    .map(c => c.priceProviderId)
    .filter((id): id is string => !!id)

  const uniqueIds = [...new Set(priceProviderIds)]
  const priceMap =
    uniqueIds.length > 0
      ? await withFallback(
          attempt(() => getCoinPrices({ ids: uniqueIds })),
          {}
        )
      : {}

  const balanceTasks = context.coins.map(async coin => {
    return withFallback(
      attempt(async () => {
        const id =
          !coin.isNativeToken && coin.contractAddress
            ? coin.contractAddress
            : undefined

        const rawBalance = await getCoinBalance({
          chain: coin.chain as Chain,
          address: coin.address,
          id,
        })

        const balance = formatBalance(rawBalance, coin.decimals)
        const priceUsd = coin.priceProviderId
          ? (priceMap[coin.priceProviderId.toLowerCase()] ?? 0)
          : 0
        const valueUsd = balance * priceUsd

        return {
          chain: coin.chain,
          ticker: coin.ticker,
          balance: balance.toFixed(6).replace(/\.?0+$/, ''),
          value_usd: Math.round(valueUsd * 100) / 100,
          price_usd: priceUsd,
          logo: coin.logo || undefined,
        }
      }),
      {
        chain: coin.chain,
        ticker: coin.ticker,
        balance: '0',
        value_usd: 0,
        price_usd: 0,
        logo: coin.logo || undefined,
      }
    )
  })

  const coinResults = await Promise.all(balanceTasks)

  const chainTotals: Record<string, number> = {}
  let totalUsd = 0

  for (const coin of coinResults) {
    chainTotals[coin.chain] = (chainTotals[coin.chain] ?? 0) + coin.value_usd
    totalUsd += coin.value_usd
  }

  const chains = Object.entries(chainTotals).map(([chain, valueUsd]) => ({
    chain,
    value_usd: Math.round(valueUsd * 100) / 100,
  }))

  const coinsOutput = coinResults.map(c => {
    const entry: Record<string, unknown> = {
      chain: c.chain,
      ticker: c.ticker,
      balance: c.balance,
      value_usd: c.value_usd,
      price_usd: c.price_usd,
    }
    if (c.logo) entry.logo = c.logo
    return entry
  })

  return {
    data: {
      total_value_usd: Math.round(totalUsd * 100) / 100,
      chains,
      coins: coinsOutput,
    },
  }
}
