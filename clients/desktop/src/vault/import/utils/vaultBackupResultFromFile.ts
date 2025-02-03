import { readFileAsArrayBuffer } from '@lib/utils/file/readFileAsArrayBuffer';
import { getVaultBackupExtension } from '../VaultBackupExtension';
import { vaultBackupResultFromFileContent } from './vaultBackupResultFromString';

export const vaultBackupResultFromFile = async (file: File) => {
  const fileContent = await readFileAsArrayBuffer(file);

  return vaultBackupResultFromFileContent({
    value: fileContent,
    extension: getVaultBackupExtension(file.name),
  });
};
