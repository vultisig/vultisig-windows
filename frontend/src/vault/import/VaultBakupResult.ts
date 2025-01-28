import { storage } from '../../../wailsjs/go/models';
import { VaultContainer } from '../../gen/vultisig/vault/v1/vault_container_pb';

export type VaultBackupResult =
  | {
      vaultContainer: VaultContainer;
    }
  | {
      vault: storage.Vault;
    };
