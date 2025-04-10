import { NonEmptyOnly } from '@lib/ui/base/NonEmptyOnly'

import { useVaultFolders } from '../queries/useVaultFoldersQuery'
import { FolderListItem } from './FolderListItem'
import { VaultFoldersContainer } from './VaultFoldersContainer'

export const VaultFolders = () => {
  const items = useVaultFolders()

  return (
    <NonEmptyOnly
      value={items}
      render={items => (
        <VaultFoldersContainer>
          {items.map((value, index) => (
            <FolderListItem key={index} id={value.id} name={value.name} />
          ))}
        </VaultFoldersContainer>
      )}
    />
  )
}
