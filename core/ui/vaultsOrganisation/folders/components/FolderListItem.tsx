import { FolderIcon } from '@lib/ui/icons/FolderIcon'
import { HStack } from '@lib/ui/layout/Stack'

import { ListItem } from '../../../../../lib/list/item/ListItem'
import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'

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
  const navigate = useCoreNavigate()

  return (
    <ListItem
      isDraggable={isDraggable}
      onClick={() => navigate({ id: 'vaultFolder', state: { id } })}
    >
      <HStack alignItems="center" gap={12}>
        <FolderIcon style={{ fontSize: 24 }} />
        {name}
      </HStack>
    </ListItem>
  )
}
