import { useVaultFolders } from '../queries/useVaultFoldersQuery';
import { FolderListItem } from './FolderListItem';
import { VaultFoldersContainer } from './VaultFoldersContainer';

export const VaultFolders = () => {
  const items = useVaultFolders();

  return (
    <VaultFoldersContainer>
      {items.map((value, index) => (
        <FolderListItem key={index} id={value.id} name={value.name} />
      ))}
    </VaultFoldersContainer>
  );
};
