import { Timestamp } from '@bufbuild/protobuf';
import { convertDuration } from '@lib/utils/time/convertDuration';

import { storage } from '../../../../wailsjs/go/models';
import { Vault, Vault_KeyShare } from '../../../gen/vultisig/vault/v1/vault_pb';
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
  const keyShares = backup.keyshares.map(
    ({ pubkey, keyshare }) =>
      new Vault_KeyShare({
        publicKey: pubkey,
        keyshare,
      })
  );

  const vault = new Vault({
    name: backup.name,
    publicKeyEcdsa: backup.pubKeyECDSA,
    publicKeyEddsa: backup.pubKeyEdDSA,
    signers: backup.signers,
    createdAt: new Timestamp({
      seconds: BigInt(Math.floor(backup.createdAt)),
      nanos: Math.floor(convertDuration(backup.createdAt % 1, 's', 'ns')),
    }),
    hexChainCode: backup.hexChainCode,
    localPartyId: backup.localPartyID,
    keyShares,
  });

  return toStorageVault(vault);
};
