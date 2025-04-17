import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { useFolderVaults } from '@core/ui/vault/state/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { getNewOrder } from '@lib/utils/order/getNewOrder'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DnDList, ItemChangeParams } from '../../../lib/dnd/DnDList'
import {
  DnDItemContainer,
  DnDItemHighlight,
} from '../../../lib/ui/list/item/DnDItemContainer'
import { FolderVaultOption } from '../addVaults/FolderVaultOption'
import { useRemoveVaultFromFolderMutation } from '../mutations/useRemoveVaultFromFolderMutation'
import { useCurrentVaultFolder } from '../state/currentVaultFolder'

export const ManageFolderVaults = () => {
  const { id } = useCurrentVaultFolder()
  const { t } = useTranslation()
  const vaults = useFolderVaults(id)
  const [items, setItems] = useState(() => sortEntitiesWithOrder(vaults))
  const { mutate: remove } = useRemoveVaultFromFolderMutation()
  const { mutateAsync: updateVault } = useUpdateVaultMutation()

  useEffect(() => {
    setItems(sortEntitiesWithOrder(vaults))
  }, [vaults])

  const handleOnItemChange = (id: string, { index }: ItemChangeParams) => {
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
        prev.map(item => (getVaultId(item) === id ? { ...item, order } : item))
      )
    )
  }

  if (isEmpty(items)) return null

  return (
    <VStack gap={8}>
      <Text weight="500" color="supporting" size={14}>
        {t('current_vaults')}
      </Text>
      <DnDList
        items={items}
        getItemId={getVaultId}
        onChange={handleOnItemChange}
        renderList={({ props }) => <VStack gap={8} {...props} />}
        renderItem={({ item, draggableProps, dragHandleProps, status }) => {
          const vaultId = getVaultId(item)

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
                    })
                  }}
                />
              </CurrentVaultProvider>
              {status === 'overlay' && <DnDItemHighlight />}
            </DnDItemContainer>
          )
        }}
      />
    </VStack>
  )
}
