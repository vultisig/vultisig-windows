import { storage } from '../../../wailsjs/go/models';
import { Vault } from '../../gen/vultisig/vault/v1/vault_pb';

export const getStorageVaultId = (vault: storage.Vault): string =>
  vault.public_key_ecdsa;

export const toStorageVault = ({
  name,
  publicKeyEcdsa,
  publicKeyEddsa,
  signers,
  createdAt,
  hexChainCode,
  keyShares,
  localPartyId,
  resharePrefix,
}: Vault): storage.Vault => ({
  name: name,
  public_key_ecdsa: publicKeyEcdsa,
  public_key_eddsa: publicKeyEddsa,
  signers: signers,
  created_at: createdAt,
  hex_chain_code: hexChainCode,
  keyshares: keyShares.map(share => ({
    public_key: share.publicKey,
    keyshare: share.keyshare,
  })),
  local_party_id: localPartyId,
  reshare_prefix: resharePrefix,
  order: 0,
  is_backed_up: true,
  coins: [],
  convertValues: () => {},
});
