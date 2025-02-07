import { create } from '@bufbuild/protobuf';
import { Timestamp, TimestampSchema } from '@bufbuild/protobuf/wkt';
import { LibType } from '@core/communication/vultisig/keygen/v1/lib_type_message_pb';
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
  libType: string;
};

type DatBackupKeyshare = {
  pubkey: string;
  keyshare: string;
};

const secondsTimestamptToProtoTimestamp = (seconds: number): Timestamp =>
  create(TimestampSchema, {
    seconds: BigInt(Math.floor(seconds)),
    nanos: Math.floor(convertDuration(seconds % 1, 's', 'ns')),
  });

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
    libType: LibType[backup.libType as keyof typeof LibType] ?? LibType.GG20,
  });

  return toStorageVault(vault);
};
