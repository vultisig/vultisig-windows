import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { getVaultBackupExtension } from '../VaultBackupExtension';
import { VaultBackupResult } from '../VaultBakupResult';
import { vaultBackupResultFromFileContent } from './vaultBackupResultFromString';

export const vaultBackupResultFromFile = (file: File) =>
  new Promise<VaultBackupResult>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const fileContent = shouldBePresent(reader.result);

        if (typeof fileContent === 'string') {
          throw new Error('Backup file content expected to be an ArrayBuffer');
        }

        const result = vaultBackupResultFromFileContent({
          value: fileContent,
          extension: getVaultBackupExtension(file.name),
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(reader.error);

    reader.readAsArrayBuffer(file);
  });
