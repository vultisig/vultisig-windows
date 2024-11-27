import { storage } from '../../../wailsjs/go/models';
import { Vault } from '../../gen/vultisig/vault/v1/vault_pb';

export const getStorageVaultId = (vault: storage.Vault): string =>
  vault.public_key_ecdsa;

export const toStorageVault = (vault: Vault): storage.Vault => {
  return storage.Vault.createFrom({
    name: vault.name,
    public_key_ecdsa: vault.publicKeyEcdsa,
    public_key_eddsa: vault.publicKeyEddsa,
    signers: vault.signers,
    created_at: vault.createdAt,
    hex_chain_code: vault.hexChainCode,
    keyshares: vault.keyShares.map(share => ({
      public_key: share.publicKey,
      keyshare: share.keyshare,
    })),
    local_party_id: vault.localPartyId,
    reshare_prefix: vault.resharePrefix,
    is_backed_up: true,
    coins: [],
  });
};
