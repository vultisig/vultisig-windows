import { getVaultId } from '@core/mpc/vault/Vault'

import { getStorageContext } from '../shared/storageContext'
import type { ToolHandler } from '../types'

export const handleListVaults: ToolHandler = async (_input, context) => {
  const storage = getStorageContext()

  const vaults = await storage.getVaults()
  const allCoins = await storage.getCoins()

  const vaultList = vaults.map(v => {
    const vaultId = getVaultId(v)
    const coins = allCoins[vaultId] ?? []
    const chainAddresses: Record<string, string> = {}
    for (const coin of coins) {
      if (!chainAddresses[coin.chain]) {
        chainAddresses[coin.chain] = coin.address
      }
    }

    return {
      name: v.name,
      public_key: vaultId,
      is_active: vaultId === context.vaultPubKey,
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
