import { getChainFromString } from '../../utils/getChainFromString'
import type { ToolHandler } from '../types'

export const handleRemoveCoin: ToolHandler = async (input, context) => {
  const store = window.go?.storage?.Store
  if (!store) throw new Error('storage not available')

  const coinId = input.coin_id ? String(input.coin_id).trim() : ''
  const chainRaw = input.chain ? String(input.chain).trim() : ''
  const ticker = input.ticker
    ? String(input.ticker).trim()
    : input.symbol
      ? String(input.symbol).trim()
      : ''

  if (!coinId && (!chainRaw || !ticker)) {
    throw new Error('Provide either coin_id, or both chain and ticker')
  }

  if (coinId) {
    await store.DeleteCoin(context.vaultPubKey, coinId)
    if (window.runtime) {
      window.runtime.EventsEmit('vault:coins-changed')
    }
    return {
      data: {
        success: true,
        removed_coin_id: coinId,
        message: `Coin removed successfully`,
      },
      vaultModified: true,
    }
  }

  const chain = getChainFromString(chainRaw) ?? chainRaw
  const lowerTicker = ticker.toLowerCase()

  const dbCoins = await store.GetVaultCoins(context.vaultPubKey)
  const dbCoin = dbCoins.find(
    c =>
      c.chain.toLowerCase() === chain.toLowerCase() &&
      c.ticker.toLowerCase() === lowerTicker
  )

  if (!dbCoin) {
    throw new Error(`Coin ${ticker} on ${chain} not found in vault`)
  }

  await store.DeleteCoin(context.vaultPubKey, dbCoin.id)

  if (window.runtime) {
    window.runtime.EventsEmit('vault:coins-changed')
  }

  return {
    data: {
      success: true,
      removed_coin: `${dbCoin.ticker} on ${dbCoin.chain}`,
      message: `${dbCoin.ticker} on ${dbCoin.chain} removed from vault`,
    },
    vaultModified: true,
  }
}
