import { Timestamp } from '@bufbuild/protobuf';

import { Vault, Vault_KeyShare } from '../../../gen/vultisig/vault/v1/vault_pb';

export type BackupVault = {
  hexChainCode: string;
  pubKeyECDSA: string;
  localPartyID: string;
  name: string;
  signers: string[];
  pubKeyEdDSA: string;
  keyshares: BackupKeyshare[];
  createdAt: number;
};

type BackupKeyshare = {
  pubkey: string;
  keyshare: string;
};

export const mapBackupVaultToVault = (backupVault: BackupVault): Vault => {
  const parsedKeyshares = backupVault.keyshares.map(k => {
    const keyshareData = JSON.parse(k.keyshare);

    const vaultKeyShare = new Vault_KeyShare();
    vaultKeyShare.publicKey = k.pubkey;
    vaultKeyShare.keyshare = keyshareData;
    return vaultKeyShare;
  });

  const vault = new Vault();
  vault.name = backupVault.name;
  vault.publicKeyEcdsa = backupVault.pubKeyECDSA;
  vault.publicKeyEddsa = backupVault.pubKeyEdDSA;
  vault.signers = backupVault.signers;

  const createdAtTimestamp = new Timestamp();
  createdAtTimestamp.seconds = Math.floor(
    backupVault.createdAt
  ) as unknown as bigint;
  createdAtTimestamp.nanos = (backupVault.createdAt % 1) * 1e9;
  vault.createdAt = createdAtTimestamp;

  vault.hexChainCode = backupVault.hexChainCode;
  vault.localPartyId = backupVault.localPartyID;
  vault.keyShares = parsedKeyshares;

  return vault;
};
