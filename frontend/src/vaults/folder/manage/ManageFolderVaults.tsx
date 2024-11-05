import { VStack } from '../../../lib/ui/layout/Stack';
import { isEmpty } from '../../../lib/utils/array/isEmpty';
import { useFolderVaults } from '../../../vault/queries/useVaultsQuery';
import { getStorageVaultId } from '../../../vault/utils/storageVault';
import { FolderVaultOption } from '../addVaults/FolderVaultOption';
import { useRemoveVaultFromFolderMutation } from '../mutations/useRemoveVaultFromFolderMutation';
import { useCurrentVaultFolder } from '../state/currentVaultFolder';

export const ManageFolderVaults = () => {
  const { id } = useCurrentVaultFolder();

  const options = useFolderVaults(id);

  const { mutate: remove } = useRemoveVaultFromFolderMutation();

  if (isEmpty(options)) return null;

  return (
    <VStack gap={8}>
      {options.map(vault => {
        const vaultId = getStorageVaultId(vault);

        return (
          <FolderVaultOption
            value={true}
            onChange={() => {
              remove({
                vaultId,
              });
            }}
            key={vaultId}
            title={vault.name}
          />
        );
      })}
    </VStack>
  );
};
