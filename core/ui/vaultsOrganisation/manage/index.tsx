import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import {
  useUpdateVaultFolderMutation,
  useVaultFolders,
} from '@core/ui/storage/vaultFolders'
import { useFolderlessVaults } from '@core/ui/storage/vaults'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { VaultSigners } from '@core/ui/vault/signers'
import { getVaultId } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { DnDList } from '@lib/ui/dnd/DnDList'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import {
  DnDItemContainer,
  DnDItemHighlight,
} from '@lib/ui/list/item/DnDItemContainer'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { getNewOrder } from '@lib/utils/order/getNewOrder'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const ManageFolders = () => {
  const { t } = useTranslation()
  const { mutate } = useUpdateVaultFolderMutation()
  const folders = useVaultFolders()
  const [items, setItems] = useState(folders)

  useEffect(() => setItems(folders), [folders])

  return folders.length ? (
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
        <VStack gap={12}>
          <Text color="light" size={12} weight={500}>
            {t('folders')}
          </Text>
          <List>{children}</List>
        </VStack>
      )}
      renderItem={({ item, draggableProps, dragHandleProps, status }) => (
        <DnDItemContainer
          {...draggableProps}
          {...dragHandleProps}
          status={status}
        >
          <ListItem
            icon={<MenuIcon fontSize={20} />}
            key={item.id}
            title={item.name}
            hoverable
          />
          {status === 'overlay' && <DnDItemHighlight />}
        </DnDItemContainer>
      )}
    />
  ) : null
}

const ManageVaults = () => {
  const { t } = useTranslation()
  const { mutate } = useUpdateVaultMutation()
  const vaults = useFolderlessVaults()
  const [items, setItems] = useState(vaults)

  useEffect(() => setItems(vaults), [vaults])

  return items.length ? (
    <DnDList
      items={items}
      getItemId={getVaultId}
      onChange={(id, { index }) => {
        const order = getNewOrder({
          orders: items.map(item => item.order),
          sourceIndex: items.findIndex(item => getVaultId(item) === id),
          destinationIndex: index,
        })

        mutate({ vaultId: id, fields: { order } })

        setItems(prevItems =>
          sortEntitiesWithOrder(
            prevItems.map(item =>
              getVaultId(item) === id ? { ...item, order } : item
            )
          )
        )
      }}
      renderList={({ props: { children } }) => (
        <VStack gap={12}>
          <Text color="light" size={12} weight={500}>
            {t('vaults')}
          </Text>
          <List>{children}</List>
        </VStack>
      )}
      renderItem={({ item, draggableProps, dragHandleProps, status }) => {
        const vaultId = getVaultId(item)

        return (
          <DnDItemContainer
            {...draggableProps}
            {...dragHandleProps}
            status={status}
            key={vaultId}
          >
            <ListItem
              icon={<MenuIcon fontSize={20} />}
              extra={<VaultSigners vault={item} />}
              title={item.name}
              hoverable
            />
            {status === 'overlay' && <DnDItemHighlight />}
          </DnDItemContainer>
        )
      }}
    />
  ) : null
}

export const ManageVaultsPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('vaults')}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <ManageFolders />
        <ManageVaults />
      </PageContent>
      <PageFooter>
        <Button onClick={() => navigate({ id: 'createVaultFolder' })}>
          {t('create_folder')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
