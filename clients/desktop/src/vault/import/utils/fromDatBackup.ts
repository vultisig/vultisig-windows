import { create } from '@bufbuild/protobuf';
import { TimestampSchema } from '@bufbuild/protobuf/wkt';
import {
  Vault_KeyShareSchema,
  VaultSchema,
} from '@core/communication/vultisig/vault/v1/vault_pb';
import { convertDuration } from '@lib/utils/time/convertDuration';

import { storage } from '../../../../wailsjs/go/models';
import { toStorageVault } from '../../utils/storageVault';

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
    createdAt: create(TimestampSchema, {
      seconds: BigInt(Math.floor(backup.createdAt)),
      nanos: Math.floor(convertDuration(backup.createdAt % 1, 's', 'ns')),
    }),
    hexChainCode: backup.hexChainCode,
    localPartyId: backup.localPartyID,
    keyShares,
  });

  return toStorageVault(vault);
};
