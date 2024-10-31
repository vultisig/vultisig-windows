import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import { storage } from '../../../wailsjs/go/models';
import { DnDItemStatus } from '../../lib/dnd/DnDItemStatus';
import { DnDList } from '../../lib/dnd/DnDList';
import { absoluteOutline } from '../../lib/ui/css/absoluteOutline';
import { borderRadius } from '../../lib/ui/css/borderRadius';
import { MenuIcon } from '../../lib/ui/icons/MenuIcon';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { ComponentWithStatusProps } from '../../lib/ui/props';
import { getColor } from '../../lib/ui/theme/getters';
import { sortEntitiesWithOrder } from '../../lib/utils/entities/EntityWithOrder';
import { match } from '../../lib/utils/match';
import { getNewOrder } from '../../lib/utils/order/getNewOrder';
import { useUpdateVaultOrderMutation } from '../../vault/mutations/useUpdateVaultOrderMutation';
import { useVaults } from '../../vault/queries/useVaultsQuery';
import { getStorageVaultId } from '../../vault/utils/storageVault';
import { VaultListOption } from '../components/VaultListOption';

const Highlight = styled.div`
  position: absolute;
  ${borderRadius.s};
  ${absoluteOutline(0, 0)}

  border: 2px solid ${getColor('primary')};
`;

const ItemContainer = styled.div<ComponentWithStatusProps<DnDItemStatus>>`
  position: relative;
  ${({ status }) =>
    match(status, {
      idle: () => css``,
      overlay: () => css`
        cursor: grabbing;
      `,
      placeholder: () => css`
        opacity: 0.4;
      `,
    })}
`;

export const ManageVaults = () => {
  const vaults = useVaults();

  const [items, setItems] = useState(() => sortEntitiesWithOrder(vaults));

  useEffect(() => {
    setItems(sortEntitiesWithOrder(vaults));
  }, [vaults]);

  const { mutate } = useUpdateVaultOrderMutation();

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

        mutate({
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
      renderList={({ props }) => <VStack gap={16} {...props} />}
      renderItem={({ item, draggableProps, dragHandleProps, status }) => {
        return (
          <ItemContainer
            {...draggableProps}
            {...dragHandleProps}
            status={status}
          >
            <VaultListOption
              title={
                <HStack alignItems="center" gap={12}>
                  <MenuIcon size={24} />
                  {item.name}
                </HStack>
              }
            />
            {status === 'overlay' && <Highlight />}
          </ItemContainer>
        );
      }}
    />
  );
};
