import { storage } from '../../../wailsjs/go/models';
import { VaultContainer } from '@core/communication/vultisig/vault/v1/vault_container_pb';

export type VaultBackupResult =
  | {
      vaultContainer: VaultContainer;
    }
  | {
      vault: storage.Vault;
    }
  | {
      encryptedVault: ArrayBuffer;
    };
