import type { ToolHandler } from '../types'

export const handleVaultInfo: ToolHandler = async (_input, context) => {
  const chains: Record<string, string> = {}
  for (const coin of context.coins) {
    if (coin.isNativeToken && !chains[coin.chain]) {
      chains[coin.chain] = coin.address
    }
  }

  const chainList = Object.entries(chains).map(([chain, address]) => ({
    chain,
    address,
  }))

  return {
    data: {
      vault_name: context.vaultName,
      public_key: context.vaultPubKey,
      chains: chainList,
      total_coins: context.coins.length,
      total_chains: chainList.length,
    },
  }
}
