import { useFolderlessVaults } from '@core/ui/storage/vaults'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { VaultListItem } from '@core/ui/vaultsOrganisation/components/VaultListItem'
import { VaultsContainer } from '@core/ui/vaultsOrganisation/components/VaultsContainer'
import { DnDList } from '@lib/ui/dnd/DnDList'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { getNewOrder } from '@lib/utils/order/getNewOrder'
import { useEffect, useState } from 'react'

import { DnDItemHighlight } from '../../../../lib/list/item/DnDItemContainer'
import { DnDItemContainer } from '../../../../lib/list/item/DnDItemContainer'

export const ManageVaults = () => {
  const vaults = useFolderlessVaults()

  const [items, setItems] = useState(vaults)

  useEffect(() => {
    setItems(vaults)
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
