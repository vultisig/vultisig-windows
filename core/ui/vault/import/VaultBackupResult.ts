import { VaultContainer } from '@vultisig/core-mpc/types/vultisig/vault/v1/vault_container_pb'
import { Vault } from '@vultisig/core-mpc/vault/Vault'

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

export type FileBasedVaultBackupResultItem = {
  result: VaultBackupResult
  override?: VaultBackupOverride
}

export type FileBasedVaultBackupResult = FileBasedVaultBackupResultItem[]
