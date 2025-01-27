import { VaultContainer } from '../../../gen/vultisig/vault/v1/vault_container_pb';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { vaultContainerFromString } from './vaultContainerFromString';

export const vaultContainerFromFile = (file: File) => {
  return new Promise<VaultContainer>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const fileContent = shouldBePresent(reader.result);

      if (fileContent instanceof ArrayBuffer) {
        resolve(VaultContainer.fromBinary(new Uint8Array(fileContent)));
      } else {
        resolve(vaultContainerFromString(fileContent));
      }
    };

    reader.onerror = () => reject(reader.error);

    reader.readAsText(file);
  });
};
