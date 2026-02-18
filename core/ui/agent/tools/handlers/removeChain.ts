import { Chain } from '@core/chain/Chain'

import { getChainFromString } from '../../utils/getChainFromString'
import { getStorageContext } from '../shared/storageContext'
import type { ToolHandler } from '../types'

export const handleRemoveChain: ToolHandler = async (input, context) => {
  const storage = getStorageContext()

  const chainInput = String(input.chain ?? '').trim()
  if (!chainInput) throw new Error('chain is required')

  const chain = getChainFromString(chainInput)
  if (!chain) {
    const supported = Object.values(Chain).join(', ')
    throw new Error(
      `Unsupported chain '${chainInput}'. Supported chains: ${supported}`
    )
  }

  const allCoins = await storage.getCoins()
  const vaultCoins = allCoins[context.vaultPubKey] ?? []
  const chainCoins = vaultCoins.filter(
    c => c.chain.toLowerCase() === chain.toLowerCase()
  )

  for (const coin of chainCoins) {
    await storage.deleteCoin({
      vaultId: context.vaultPubKey,
      coinKey: {
        chain: coin.chain,
        id: coin.id,
        address: coin.address,
      },
    })
  }

  return {
    data: {
      success: true,
      chain,
      removed_count: chainCoins.length,
      message: `Removed ${chain} and ${chainCoins.length} coin(s) from vault`,
    },
    vaultModified: true,
  }
}
