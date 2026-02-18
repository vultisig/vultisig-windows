import { Chain } from '@core/chain/Chain'

import { getChainFromString } from '../../utils/getChainFromString'
import type { ToolHandler } from '../types'

export const handleRemoveChain: ToolHandler = async (input, context) => {
  const store = window.go?.storage?.Store
  if (!store) throw new Error('storage not available')

  const chainInput = String(input.chain ?? '').trim()
  if (!chainInput) throw new Error('chain is required')

  const chain = getChainFromString(chainInput)
  if (!chain) {
    const supported = Object.values(Chain).join(', ')
    throw new Error(
      `Unsupported chain '${chainInput}'. Supported chains: ${supported}`
    )
  }

  const count = await store.DeleteCoinsByChain(context.vaultPubKey, chain)

  if (window.runtime) {
    window.runtime.EventsEmit('vault:coins-changed')
  }

  return {
    data: {
      success: true,
      chain,
      removed_count: count,
      message: `Removed ${chain} and ${count} coin(s) from vault`,
    },
    vaultModified: true,
  }
}
