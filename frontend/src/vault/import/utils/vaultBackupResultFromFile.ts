import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { getVaultBackupExtension } from '../VaultBackupExtension';
import { VaultBackupResult } from '../VaultBakupResult';
import { vaultBackupResultFromString } from './vaultBackupResultFromString';

export const vaultBackupResultFromFile = (file: File) =>
  new Promise<VaultBackupResult>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const fileContent = shouldBePresent(reader.result);
        if (fileContent instanceof ArrayBuffer) {
          throw new Error('Backup file content expected to be a string');
        }

        const result = vaultBackupResultFromString({
          value: fileContent,
          extension: getVaultBackupExtension(file.name),
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(reader.error);

    reader.readAsText(file);
  });
