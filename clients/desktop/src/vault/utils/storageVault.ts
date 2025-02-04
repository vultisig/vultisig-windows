import { create } from '@bufbuild/protobuf';
import { Timestamp, TimestampSchema } from '@bufbuild/protobuf/wkt';
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
  created_at: createdAt
    ? protoTimestampToISOString(createdAt)
    : new Date().toISOString(),
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

export const protoTimestampToISOString = (timestamp: Timestamp): string => {
  const date = new Date(convertDuration(Number(timestamp.seconds), 's', 'ms'));
  const isoWithoutNanos = date.toISOString().slice(0, -1); // Remove the Z
  const nanoStr = timestamp.nanos.toString().padStart(9, '0');
  return `${isoWithoutNanos}${nanoStr}Z`;
};

export const isoStringToProtoTimestamp = (isoString: string): Timestamp => {
  const date = new Date(isoString);
  const seconds = BigInt(
    Math.floor(convertDuration(date.getTime(), 'ms', 's'))
  );
  const nanos = Number(
    isoString.split('.')[1]?.replace('Z', '').padEnd(9, '0') || 0
  );
  return create(TimestampSchema, { seconds, nanos });
};

export const fromStorageVault = (vault: storage.Vault): Vault =>
  create(VaultSchema, {
    name: vault.name,
    publicKeyEcdsa: vault.public_key_ecdsa,
    publicKeyEddsa: vault.public_key_eddsa,
    signers: vault.signers,
    createdAt: isoStringToProtoTimestamp(vault.created_at),
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
