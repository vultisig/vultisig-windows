import { VaultContainer } from '@core/mpc/types/vultisig/vault/v1/vault_container_pb'

import { storage } from '../../../wailsjs/go/models'

export type VaultBackupResult =
  | {
      vaultContainer: VaultContainer
    }
  | {
      vault: storage.Vault
    }
  | {
      encryptedVault: ArrayBuffer
    }

export type VaultBackupOverride = Pick<storage.Vault, 'lib_type'>

export type FileBasedVaultBackupResult = {
  result: VaultBackupResult
  override?: VaultBackupOverride
}
