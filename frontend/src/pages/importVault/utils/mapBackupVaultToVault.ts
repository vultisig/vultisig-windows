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
  keyshare: string; // This contains JSON with potential large numbers.
};

// Custom reviver to handle large integers (BigInt) during JSON parsing
const bigIntReviver = (key: string, value: any) => {
  if (typeof value === 'string' && /^\d{16,}$/.test(value)) {
    try {
      return BigInt(value);
    } catch {
      return value;
    }
  }
  return value;
};

export const mapBackupVaultToVault = (backupVault: BackupVault): Vault => {
  const parsedKeyshares = backupVault.keyshares.map(k => {
    const vaultKeyShare = new Vault_KeyShare();

    vaultKeyShare.publicKey = k.pubkey;

    try {
      const keyshareData = JSON.parse(k.keyshare, bigIntReviver);

      vaultKeyShare.keyshare = keyshareData;
    } catch (e) {
      console.error('Failed to parse keyshare:', e);
      throw new Error('Invalid keyshare format');
    }

    return vaultKeyShare;
  });

  const vault = new Vault();
  vault.name = backupVault.name;
  vault.publicKeyEcdsa = backupVault.pubKeyECDSA;
  vault.publicKeyEddsa = backupVault.pubKeyEdDSA;
  vault.signers = backupVault.signers;

  const createdAtTimestamp = new Timestamp();
  // Ensure that createdAt is rounded to aninteger
  createdAtTimestamp.seconds = Math.floor(
    backupVault.createdAt
  ) as unknown as bigint;

  createdAtTimestamp.nanos = Math.floor((backupVault.createdAt % 1) * 1e9);
  vault.createdAt = createdAtTimestamp;

  vault.hexChainCode = backupVault.hexChainCode;
  vault.localPartyId = backupVault.localPartyID;
  vault.keyShares = parsedKeyshares;

  return vault;
};
