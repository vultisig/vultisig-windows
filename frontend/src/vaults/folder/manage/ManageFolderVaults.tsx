import { useEffect, useState } from 'react';

import { storage } from '../../../../wailsjs/go/models';
import { DnDList } from '../../../lib/dnd/DnDList';
import { VStack } from '../../../lib/ui/layout/Stack';
import {
  DnDItemContainer,
  DnDItemHighlight,
} from '../../../lib/ui/list/item/DnDItemContainer';
import { isEmpty } from '../../../lib/utils/array/isEmpty';
import { sortEntitiesWithOrder } from '../../../lib/utils/entities/EntityWithOrder';
import { getNewOrder } from '../../../lib/utils/order/getNewOrder';
import { useUpdateVaultOrderMutation } from '../../../vault/mutations/useUpdateVaultOrderMutation';
import { useFolderVaults } from '../../../vault/queries/useVaultsQuery';
import { CurrentVaultProvider } from '../../../vault/state/currentVault';
import { getStorageVaultId } from '../../../vault/utils/storageVault';
import { FolderVaultOption } from '../addVaults/FolderVaultOption';
import { useRemoveVaultFromFolderMutation } from '../mutations/useRemoveVaultFromFolderMutation';
import { useCurrentVaultFolder } from '../state/currentVaultFolder';

export const ManageFolderVaults = () => {
  const { id } = useCurrentVaultFolder();

  const vaults = useFolderVaults(id);

  const [items, setItems] = useState(() => sortEntitiesWithOrder(vaults));

  useEffect(() => {
    setItems(sortEntitiesWithOrder(vaults));
  }, [vaults]);

  const { mutate: remove } = useRemoveVaultFromFolderMutation();

  const { mutate: updateOrder } = useUpdateVaultOrderMutation();

  if (isEmpty(items)) return null;

  return (
    <DnDList
      items={items}
      getItemId={getStorageVaultId}
      onChange={(id, { index }) => {
        const order = getNewOrder({
          orders: items.map(item => item.order),
          sourceIndex: items.findIndex(item => getStorageVaultId(item) === id),
          destinationIndex: index,
        });

        updateOrder({
          id,
          order,
        });

        setItems(prev =>
          sortEntitiesWithOrder(
            prev.map(
              item =>
                (getStorageVaultId(item) === id
                  ? { ...item, order }
                  : item) as storage.Vault
            )
          )
        );
      }}
      renderList={({ props }) => <VStack gap={8} {...props} />}
      renderItem={({ item, draggableProps, dragHandleProps, status }) => {
        const vaultId = getStorageVaultId(item);

        return (
          <DnDItemContainer
            key={vaultId}
            {...draggableProps}
            {...dragHandleProps}
            status={status}
          >
            <CurrentVaultProvider value={item}>
              <FolderVaultOption
                isDraggable
                value={true}
                onChange={() => {
                  remove({
                    vaultId,
                  });
                }}
              />
            </CurrentVaultProvider>
            {status === 'overlay' && <DnDItemHighlight />}
          </DnDItemContainer>
        );
      }}
    />
  );
};
