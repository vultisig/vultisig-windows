import { useNavigate } from 'react-router-dom';

import { FolderIcon } from '../../../lib/ui/icons/FolderIcon';
import { HStack } from '../../../lib/ui/layout/Stack';
import { ListItem } from '../../../lib/ui/list/item/ListItem';
import { makeAppPath } from '../../../navigation';

type FolderListItemProps = {
  isDraggable?: boolean;
  name: string;
  id: string;
};

export const FolderListItem = ({
  name,
  isDraggable,
  id,
}: FolderListItemProps) => {
  const navigate = useNavigate();

  return (
    <ListItem
      isDraggable={isDraggable}
      onClick={() => navigate(makeAppPath('vaultFolder', { id }))}
      title={
        <HStack alignItems="center" gap={12}>
          <FolderIcon style={{ fontSize: 24 }} />
          {name}
        </HStack>
      }
    />
  );
};
