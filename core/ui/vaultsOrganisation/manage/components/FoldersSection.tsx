import {
  useUpdateVaultFolderMutation,
  useVaultFolders,
} from '@core/ui/storage/vaultFolders'
import { useVaults } from '@core/ui/storage/vaults'
import {
  LeadingIconBadge,
  VaultListRow,
} from '@core/ui/vaultsOrganisation/components'
import { DnDList } from '@lib/ui/dnd/DnDList'
import { FolderLockIcon } from '@lib/ui/icons/FolderLockIcon'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import {
  DnDItemContainer,
  DnDItemHighlight,
} from '@lib/ui/list/item/DnDItemContainer'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { getNewOrder } from '@lib/utils/order/getNewOrder'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const FoldersSection = () => {
  const { t } = useTranslation()
  const { mutate } = useUpdateVaultFolderMutation()
  const folders = useVaultFolders()
  const allVaults = useVaults()
  const [items, setItems] = useState(folders)

  useEffect(() => setItems(folders), [folders])

  const vaultCountByFolder = useMemo(() => {
    const map = new Map<string, number>()
    allVaults.forEach(vault => {
      if (!vault.folderId) return
      map.set(vault.folderId, (map.get(vault.folderId) ?? 0) + 1)
    })
    return map
  }, [allVaults])

  if (!items.length) {
    return null
  }

  return (
    <DnDList
      items={items}
      getItemId={item => item.id}
      onChange={(id, { index }) => {
        const order = getNewOrder({
          orders: items.map(item => item.order),
          sourceIndex: items.findIndex(item => item.id === id),
          destinationIndex: index,
        })

        mutate({ id, fields: { order } })

        setItems(prevItems =>
          sortEntitiesWithOrder(
            prevItems.map(item => (item.id === id ? { ...item, order } : item))
          )
        )
      }}
      renderList={({ props: { children } }) => (
        <VStack gap={16}>
          <Text
            size={13}
            weight={600}
            color="shy"
            style={{ textTransform: 'uppercase' }}
          >
            {t('folders')}
          </Text>
          <VStack gap={12}>{children}</VStack>
        </VStack>
      )}
      renderItem={({ item, draggableProps, dragHandleProps, status }) => (
        <DnDItemContainer key={item.id} {...draggableProps} status={status}>
          <VaultListRow
            leading={
              <LeadingGroup>
                <DragHandle {...dragHandleProps}>
                  <MenuIcon fontSize={20} />
                </DragHandle>
                <LeadingIconBadge tone="neutral">
                  <FolderLockIcon style={{ fontSize: 20 }} />
                </LeadingIconBadge>
              </LeadingGroup>
            }
            title={item.name}
            subtitle={t('vault_count', {
              count: vaultCountByFolder.get(item.id) ?? 0,
            })}
          />
          {status === 'overlay' && <DnDItemHighlight />}
        </DnDItemContainer>
      )}
    />
  )
}

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  color: ${getColor('textShy')};
  cursor: grab;
  padding: 4px 0;
`

const LeadingGroup = styled(HStack)`
  gap: 12px;
  align-items: center;
`
