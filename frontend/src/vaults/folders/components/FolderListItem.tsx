import { FolderIcon } from '../../../lib/ui/icons/FolderIcon';
import { HStack } from '../../../lib/ui/layout/Stack';
import { ListItem } from '../../../lib/ui/list/item/ListItem';

type FolderListItemProps = {
  isDraggable?: boolean;
  name: string;
  id: string;
};

export const FolderListItem = ({ name, isDraggable }: FolderListItemProps) => {
  return (
    <ListItem
      isDraggable={isDraggable}
      title={
        <HStack alignItems="center" gap={12}>
          <FolderIcon style={{ fontSize: 24 }} />
          {name}
        </HStack>
      }
    />
  );
};
