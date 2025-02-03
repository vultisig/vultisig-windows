import { create } from '@bufbuild/protobuf';
import { TimestampSchema } from '@bufbuild/protobuf/wkt';
import {
  Vault,
  Vault_KeyShareSchema,
  VaultSchema,
} from '@core/communication/vultisig/vault/v1/vault_pb';
import { convertDuration } from '@lib/utils/time/convertDuration';

import { storage } from '../../../wailsjs/go/models';

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

export const fromStorageVault = (vault: storage.Vault): Vault =>
  create(VaultSchema, {
    name: vault.name,
    publicKeyEcdsa: vault.public_key_ecdsa,
    publicKeyEddsa: vault.public_key_eddsa,
    signers: vault.signers,
    createdAt: create(TimestampSchema, {
      seconds: BigInt(Math.floor(vault.created_at)),
      nanos: Math.floor(convertDuration(vault.created_at % 1, 's', 'ns')),
    }),
    hexChainCode: vault.hex_chain_code,
    localPartyId: vault.local_party_id,
    keyShares: vault.keyshares.map(({ public_key, keyshare }) =>
      create(Vault_KeyShareSchema, {
        publicKey: public_key,
        keyshare,
      })
    ),
    resharePrefix: vault.reshare_prefix,
  });
