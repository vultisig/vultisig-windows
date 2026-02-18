import type { ToolHandler } from '../types'

export const handleListVaults: ToolHandler = async (_input, context) => {
  const store = window.go?.storage?.Store
  if (!store) throw new Error('storage not available')

  const vaults = await store.GetVaults()
  const allCoins = await store.GetCoins()

  const vaultList = vaults.map(v => {
    const coins = allCoins[v.publicKeyEcdsa] ?? []
    const chainAddresses: Record<string, string> = {}
    for (const coin of coins) {
      if (!chainAddresses[coin.chain]) {
        chainAddresses[coin.chain] = coin.address
      }
    }

    return {
      name: v.name,
      public_key: v.publicKeyEcdsa,
      is_active: v.publicKeyEcdsa === context.vaultPubKey,
      chain_addresses: chainAddresses,
      total_chains: Object.keys(chainAddresses).length,
    }
  })

  return {
    data: {
      vaults: vaultList,
      total_count: vaultList.length,
      active_vault: context.vaultName,
    },
  }
}
