import { isEmpty } from '@lib/utils/array/isEmpty';
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder';
import { getNewOrder } from '@lib/utils/order/getNewOrder';
import { useEffect, useState } from 'react';

import { storage } from '../../../../wailsjs/go/models';
import { DnDList } from '../../../lib/dnd/DnDList';
import {
  DnDItemContainer,
  DnDItemHighlight,
} from '../../../lib/ui/list/item/DnDItemContainer';
import { useUpdateVaultFolderOrderMutation } from '../../folder/mutations/useUpdateVaultFolderOrderMutation';
import { FolderListItem } from '../components/FolderListItem';
import { VaultFoldersContainer } from '../components/VaultFoldersContainer';
import { useVaultFolders } from '../queries/useVaultFoldersQuery';

export const ManageVaultFolders = () => {
  const folders = useVaultFolders();

  const [items, setItems] = useState(() => sortEntitiesWithOrder(folders));

  useEffect(() => {
    setItems(sortEntitiesWithOrder(folders));
  }, [folders]);

  const { mutate } = useUpdateVaultFolderOrderMutation();

  if (isEmpty(items)) return null;

  return (
    <DnDList<string, storage.VaultFolder>
      items={items}
      getItemId={item => item.id}
      onChange={(id, { index }) => {
        const order = getNewOrder({
          orders: items.map(item => item.order),
          sourceIndex: items.findIndex(item => item.id === id),
          destinationIndex: index,
        });

        mutate({
          id,
          order,
        });

        setItems(prev =>
          sortEntitiesWithOrder(
            prev.map(
              item =>
                (item.id === id
                  ? { ...item, order }
                  : item) as storage.VaultFolder
            )
          )
        );
      }}
      renderList={({ props }) => <VaultFoldersContainer {...props} />}
      renderItem={({ item, draggableProps, dragHandleProps, status }) => {
        return (
          <DnDItemContainer
            {...draggableProps}
            {...dragHandleProps}
            status={status}
          >
            <FolderListItem isDraggable id={item.id} name={item.name} />
            {status === 'overlay' && <DnDItemHighlight />}
          </DnDItemContainer>
        );
      }}
    />
  );
};
