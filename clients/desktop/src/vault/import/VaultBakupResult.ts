import { VaultContainer } from '@core/mpc/types/vultisig/vault/v1/vault_container_pb'
import { Vault } from '@core/ui/vault/Vault'

export type VaultBackupResult =
  | {
      vaultContainer: VaultContainer
    }
  | {
      vault: Vault
    }
  | {
      encryptedVault: ArrayBuffer
    }

export type VaultBackupOverride = Pick<Vault, 'libType'>

export type FileBasedVaultBackupResult = {
  result: VaultBackupResult
  override?: VaultBackupOverride
}
