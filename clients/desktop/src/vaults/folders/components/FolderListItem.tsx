import { FolderIcon } from '@lib/ui/icons/FolderIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { useAppNavigate } from '@lib/ui/navigation/hooks/useAppNavigate'

import { ListItem } from '../../../lib/ui/list/item/ListItem'

type FolderListItemProps = {
  isDraggable?: boolean
  name: string
  id: string
}

export const FolderListItem = ({
  name,
  isDraggable,
  id,
}: FolderListItemProps) => {
  const navigate = useAppNavigate()

  return (
    <ListItem
      isDraggable={isDraggable}
      onClick={() => navigate('vaultFolder', { params: { id } })}
    >
      <HStack alignItems="center" gap={12}>
        <FolderIcon style={{ fontSize: 24 }} />
        {name}
      </HStack>
    </ListItem>
  )
}
