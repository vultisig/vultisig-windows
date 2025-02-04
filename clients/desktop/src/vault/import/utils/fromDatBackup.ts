import { create } from '@bufbuild/protobuf';
import {
  Vault_KeyShareSchema,
  VaultSchema,
} from '@core/communication/vultisig/vault/v1/vault_pb';

import { storage } from '../../../../wailsjs/go/models';
import {
  secondsTimestamptToProtoTimestamp,
  toStorageVault,
} from '../../utils/storageVault';

export type DatBackup = {
  name: string;
  pubKeyECDSA: string;
  signers: string[];
  keyshares: DatBackupKeyshare[];
  createdAt: number;
  pubKeyEdDSA: string;
  hexChainCode: string;
  localPartyID: string;
};

type DatBackupKeyshare = {
  pubkey: string;
  keyshare: string;
};

export const fromDatBackup = (backup: DatBackup): storage.Vault => {
  const keyShares = backup.keyshares.map(({ pubkey, keyshare }) =>
    create(Vault_KeyShareSchema, {
      publicKey: pubkey,
      keyshare,
    })
  );

  const vault = create(VaultSchema, {
    name: backup.name,
    publicKeyEcdsa: backup.pubKeyECDSA,
    publicKeyEddsa: backup.pubKeyEdDSA,
    signers: backup.signers,
    createdAt: secondsTimestamptToProtoTimestamp(backup.createdAt),
    hexChainCode: backup.hexChainCode,
    localPartyId: backup.localPartyID,
    keyShares,
  });

  return toStorageVault(vault);
};
