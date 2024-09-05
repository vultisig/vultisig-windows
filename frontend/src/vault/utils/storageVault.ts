import { storage } from '../../../wailsjs/go/models';

export const getStorageVaultId = (vault: storage.Vault): string =>
  vault.public_key_ecdsa;
