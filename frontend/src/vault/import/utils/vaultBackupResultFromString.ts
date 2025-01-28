import { VaultBackupExtension } from '../VaultBackupExtension';
import { VaultBackupResult } from '../VaultBakupResult';
import { DatBackup, fromDatBackup } from './fromDatBackup';
import { vaultContainerFromString } from './vaultContainerFromString';

type Input = {
  extension: VaultBackupExtension;
  value: string;
};

export const vaultBackupResultFromString = ({
  value,
  extension,
}: Input): VaultBackupResult => {
  if (extension === 'dat') {
    try {
      const decodedString = Buffer.from(value, 'hex').toString('utf8');

      const datBackup = JSON.parse(decodedString) as DatBackup;
      const vault = fromDatBackup(datBackup);

      return { vault };
    } catch {
      return { encryptedVault: value };
    }
  }

  return { vaultContainer: vaultContainerFromString(value) };
};
