import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { useFolderlessVaults } from '@core/ui/vault/state/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { getNewOrder } from '@lib/utils/order/getNewOrder'
import { useEffect, useState } from 'react'

import { DnDList } from '../../lib/dnd/DnDList'
import {
  DnDItemContainer,
  DnDItemHighlight,
} from '../../lib/ui/list/item/DnDItemContainer'
import { VaultListItem } from '../components/VaultListItem'
import { VaultsContainer } from '../components/VaultsContainer'

export const ManageVaults = () => {
  const vaults = useFolderlessVaults()

  const [items, setItems] = useState(() => sortEntitiesWithOrder(vaults))

  useEffect(() => {
    setItems(sortEntitiesWithOrder(vaults))
  }, [vaults])

  const { mutateAsync: updateVault } = useUpdateVaultMutation()

  if (isEmpty(items)) return null

  return (
    <DnDList
      items={items}
      getItemId={getVaultId}
      onChange={(id, { index }) => {
        const order = getNewOrder({
          orders: items.map(item => item.order),
          sourceIndex: items.findIndex(item => getVaultId(item) === id),
          destinationIndex: index,
        })

        updateVault({
          vaultId: id,
          fields: { order },
        })

        setItems(prev =>
          sortEntitiesWithOrder(
            prev.map(item =>
              getVaultId(item) === id ? { ...item, order } : item
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
            key={getVaultId(item)}
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
