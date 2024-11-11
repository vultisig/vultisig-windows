import { isEmpty } from '../../lib/utils/array/isEmpty';
import { useFolderlessVaults } from '../../vault/queries/useVaultsQuery';
import { getStorageVaultId } from '../../vault/utils/storageVault';
import { AddVaultsToFolderContainer } from '../folder/addVaults/AddVaultsToFolderContainer';
import { FolderVaultOption } from '../folder/addVaults/FolderVaultOption';
import { useAddVaultToFolderMutation } from '../folder/mutations/useAddVaultToFolderMutation';
import { useCurrentVaultFolder } from '../folder/state/currentVaultFolder';

export const AddVaultsToFolder = () => {
  const options = useFolderlessVaults();

  const { id } = useCurrentVaultFolder();

  const { mutate } = useAddVaultToFolderMutation();

  if (isEmpty(options)) return null;

  return (
    <AddVaultsToFolderContainer>
      {options.map(vault => {
        const vaultId = getStorageVaultId(vault);

        return (
          <FolderVaultOption
            value={false}
            onChange={() => {
              mutate({
                vaultId,
                folderId: id,
              });
            }}
            key={vaultId}
            title={vault.name}
          />
        );
      })}
    </AddVaultsToFolderContainer>
  );
};
