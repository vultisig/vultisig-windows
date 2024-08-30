import { storage } from '../../../wailsjs/go/models';

export const getVaultId = (vault: storage.Vault): string =>
  vault.public_key_ecdsa;
