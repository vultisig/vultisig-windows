import { useVaults } from '@core/ui/storage/vaults'
import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { hasServer, isServer } from '@vultisig/core-mpc/devices/localPartyId'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'

const getVaultSecurityType = (
  vault: ReturnType<typeof useVaults>[number]
): VaultSecurityType => {
  const isFast = hasServer(vault.signers) && !isServer(vault.localPartyId)
  return isFast ? 'fast' : 'secure'
}

export const toVaultNotificationItems = (
  vaults: ReturnType<typeof useVaults>,
  enabledById: Record<string, boolean>
) =>
  vaults.map(v => ({
    id: getVaultId(v),
    name: v.name,
    type: getVaultSecurityType(v),
    enabled: enabledById[getVaultId(v)] ?? false,
  }))
