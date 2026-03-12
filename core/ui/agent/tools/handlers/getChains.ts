import type { ToolHandler } from '../types'

export const handleGetChains: ToolHandler = async (_input, context) => {
  const chains: Record<string, string> = {}
  for (const coin of context.coins) {
    if (!chains[coin.chain]) {
      chains[coin.chain] = coin.address
    }
  }

  const chainList = Object.entries(chains).map(([chain, address]) => ({
    chain,
    address,
  }))

  return {
    data: {
      chains: chainList,
      total_count: chainList.length,
    },
  }
}
