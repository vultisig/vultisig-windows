import { Chain } from '@core/chain/Chain'

import { getChainFromString } from '../../utils/getChainFromString'
import { getStorageContext } from '../shared/storageContext'
import type { ToolHandler } from '../types'

export const handleRemoveCoin: ToolHandler = async (input, context) => {
  const storage = getStorageContext()

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
    const parts = coinId.split(':')
    const coinChain = parts[0] as Chain
    const coinAddress = parts.length === 3 ? parts[2] : parts[1]
    const coinContractId = parts.length === 3 ? parts[1] : undefined

    await storage.deleteCoin({
      vaultId: context.vaultPubKey,
      coinKey: {
        chain: coinChain,
        id: coinContractId || undefined,
        address: coinAddress,
      },
    })

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

  const matchedCoin = context.coins.find(
    c =>
      c.chain.toLowerCase() === chain.toLowerCase() &&
      c.ticker.toLowerCase() === lowerTicker
  )

  if (!matchedCoin) {
    throw new Error(`Coin ${ticker} on ${chain} not found in vault`)
  }

  await storage.deleteCoin({
    vaultId: context.vaultPubKey,
    coinKey: {
      chain: matchedCoin.chain as Chain,
      id: matchedCoin.contractAddress || undefined,
      address: matchedCoin.address,
    },
  })

  return {
    data: {
      success: true,
      removed_coin: `${matchedCoin.ticker} on ${matchedCoin.chain}`,
      message: `${matchedCoin.ticker} on ${matchedCoin.chain} removed from vault`,
    },
    vaultModified: true,
  }
}
