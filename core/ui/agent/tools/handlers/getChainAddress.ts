import type { ToolHandler } from '../types'

export const handleGetChainAddress: ToolHandler = async (input, context) => {
  const chain = String(input.chain ?? '').trim()
  if (!chain) {
    throw new Error('chain is required')
  }

  const lowerChain = chain.toLowerCase()
  for (const coin of context.coins) {
    if (coin.chain.toLowerCase() === lowerChain) {
      return {
        data: {
          chain: coin.chain,
          address: coin.address,
          found: true,
        },
      }
    }
  }

  const availableChains = [...new Set(context.coins.map(c => c.chain))]
  return {
    data: {
      chain,
      found: false,
      message: `Chain '${chain}' not found in vault`,
      available_chains: availableChains,
    },
  }
}
