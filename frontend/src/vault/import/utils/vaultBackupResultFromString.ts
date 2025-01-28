import { VaultBackupExtension } from '../VaultBackupExtension';
import { VaultBackupResult } from '../VaultBakupResult';
import { DatBackup, fromDatBackup } from './fromDatBackup';
import { vaultContainerFromString } from './vaultContainerFromString';

type Input = {
  extension: VaultBackupExtension;
  value: ArrayBuffer;
};

export const vaultBackupResultFromFileContent = ({
  value,
  extension,
}: Input): VaultBackupResult => {
  const valueAsString = new TextDecoder().decode(value);

  if (extension === 'dat') {
    try {
      const decodedString = Buffer.from(valueAsString, 'hex').toString('utf8');

      const datBackup = JSON.parse(decodedString) as DatBackup;
      const vault = fromDatBackup(datBackup);

      return { vault };
    } catch {
      return { encryptedVault: value };
    }
  }

  return { vaultContainer: vaultContainerFromString(valueAsString) };
};
