import { Chain } from '@core/chain/Chain'
import { getCoinBalance } from '@core/chain/coin/balance'

import type { ToolHandler } from '../types'

function formatBalance(raw: bigint, decimals: number, maxDecimals = 6): string {
  if (raw === 0n) return '0'

  const divisor = 10n ** BigInt(decimals)
  const whole = raw / divisor
  const remainder = raw % divisor

  if (remainder === 0n) return whole.toString()

  let remainderStr = remainder.toString().padStart(decimals, '0')
  remainderStr = remainderStr.replace(/0+$/, '')
  if (!remainderStr) return whole.toString()
  if (remainderStr.length > maxDecimals) {
    remainderStr = remainderStr.slice(0, maxDecimals)
  }

  return `${whole}.${remainderStr}`
}

export const handleGetBalances: ToolHandler = async (input, context) => {
  const chainFilter = input.chain
    ? String(input.chain).toLowerCase()
    : undefined
  const tickerFilter = input.ticker
    ? String(input.ticker).toUpperCase()
    : undefined

  const coins: Record<string, unknown>[] = []

  const tasks = context.coins
    .filter(coin => {
      if (chainFilter && coin.chain.toLowerCase() !== chainFilter) return false
      if (tickerFilter && coin.ticker.toUpperCase() !== tickerFilter)
        return false
      return true
    })
    .map(async coin => {
      const coinInfo: Record<string, unknown> = {
        chain: coin.chain,
        ticker: coin.ticker,
        address: coin.address,
        is_native: coin.isNativeToken,
        decimals: coin.decimals,
        contract_address: coin.contractAddress ?? '',
      }

      try {
        const id =
          !coin.isNativeToken && coin.contractAddress
            ? coin.contractAddress
            : undefined

        const balance = await getCoinBalance({
          chain: coin.chain as Chain,
          address: coin.address,
          id,
        })

        coinInfo.balance_raw = balance.toString()
        coinInfo.balance = formatBalance(balance, coin.decimals)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        coinInfo.balance_error = message
        coinInfo.balance_raw = '0'
        coinInfo.balance = '0'
      }

      if (coin.logo) {
        coinInfo.logo = coin.logo
      }

      return coinInfo
    })

  const results = await Promise.all(tasks)
  coins.push(...results)

  return {
    data: {
      coins,
      count: coins.length,
    },
  }
}
