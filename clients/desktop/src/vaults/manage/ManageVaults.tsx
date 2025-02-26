import { isEmpty } from '@lib/utils/array/isEmpty'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { getNewOrder } from '@lib/utils/order/getNewOrder'
import { useEffect, useState } from 'react'

import { storage } from '../../../wailsjs/go/models'
import { DnDList } from '../../lib/dnd/DnDList'
import {
  DnDItemContainer,
  DnDItemHighlight,
} from '../../lib/ui/list/item/DnDItemContainer'
import { useUpdateVaultOrderMutation } from '../../vault/mutations/useUpdateVaultOrderMutation'
import { useFolderlessVaults } from '../../vault/queries/useVaultsQuery'
import { CurrentVaultProvider } from '../../vault/state/currentVault'
import { getStorageVaultId } from '../../vault/utils/storageVault'
import { VaultListItem } from '../components/VaultListItem'
import { VaultsContainer } from '../components/VaultsContainer'

export const ManageVaults = () => {
  const vaults = useFolderlessVaults()

  const [items, setItems] = useState(() => sortEntitiesWithOrder(vaults))

  useEffect(() => {
    setItems(sortEntitiesWithOrder(vaults))
  }, [vaults])

  const { mutate } = useUpdateVaultOrderMutation()

  if (isEmpty(items)) return null

  return (
    <DnDList
      items={items}
      getItemId={getStorageVaultId}
      onChange={(id, { index }) => {
        const order = getNewOrder({
          orders: items.map(item => item.order),
          sourceIndex: items.findIndex(item => getStorageVaultId(item) === id),
          destinationIndex: index,
        })

        mutate({
          id,
          order,
        })

        setItems(prev =>
          sortEntitiesWithOrder(
            prev.map(
              item =>
                (getStorageVaultId(item) === id
                  ? { ...item, order }
                  : item) as storage.Vault
            )
          )
        )
      }}
      renderList={({ props }) => <VaultsContainer {...props} />}
      renderItem={({ item, draggableProps, dragHandleProps, status }) => {
        return (
          <DnDItemContainer
            {...draggableProps}
            {...dragHandleProps}
            status={status}
            key={getStorageVaultId(item)}
          >
            <CurrentVaultProvider value={item}>
              <VaultListItem isDraggable />
            </CurrentVaultProvider>
            {status === 'overlay' && <DnDItemHighlight />}
          </DnDItemContainer>
        )
      }}
    />
  )
}
