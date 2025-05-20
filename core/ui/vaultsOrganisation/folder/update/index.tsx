import {
  useUpdateVaultFolderMutation,
  useVaultFolders,
} from '@core/ui/storage/vaultFolders'
import { useFolderlessVaults, useFolderVaults } from '@core/ui/storage/vaults'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { VaultSigners } from '@core/ui/vault/signers'
import { getVaultId } from '@core/ui/vault/Vault'
import { DeleteVaultFolder } from '@core/ui/vaultsOrganisation/folder/delete'
import { useAddVaultToFolderMutation } from '@core/ui/vaultsOrganisation/folder/mutations/useAddVaultToFolderMutation'
import { useRemoveVaultFromFolderMutation } from '@core/ui/vaultsOrganisation/folder/mutations/useRemoveVaultFromFolderMutation'
import { useCurrentVaultFolder } from '@core/ui/vaultsOrganisation/folder/state/currentVaultFolder'
import { Button } from '@lib/ui/buttons/Button'
import { DnDList } from '@lib/ui/dnd/DnDList'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import {
  DnDItemContainer,
  DnDItemHighlight,
} from '@lib/ui/list/item/DnDItemContainer'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { getNewOrder } from '@lib/utils/order/getNewOrder'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const AddVaultsToFolder = () => {
  const { t } = useTranslation()
  const { id } = useCurrentVaultFolder()
  const { mutate } = useAddVaultToFolderMutation()
  const vaults = useFolderlessVaults()

  return vaults.length ? (
    <VStack gap={12}>
      <Text color="light" size={12} weight={500}>
        {t('add_vaults_to_folder')}
      </Text>
      <List>
        {vaults.map(vault => {
          const vaultId = getVaultId(vault)

          return (
            <ListItem
              key={vaultId}
              extra={
                <>
                  <VaultSigners vault={vault} />
                  <Switch />
                </>
              }
              onClick={() => mutate({ vaultId, folderId: id })}
              title={vault.name}
              hoverable
            />
          )
        })}
      </List>
    </VStack>
  ) : null
}

const ManageFolderVaults = () => {
  const { t } = useTranslation()
  const { id } = useCurrentVaultFolder()
  const vaults = useFolderVaults(id)
  const [items, setItems] = useState(vaults)
  const { mutate: remove } = useRemoveVaultFromFolderMutation()
  const { mutate: updateVault } = useUpdateVaultMutation()

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

        updateVault({ vaultId: id, fields: { order } })

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
            {t('current_vaults')}
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
              extra={
                <>
                  <VaultSigners vault={item} />
                  <Switch checked />
                </>
              }
              onClick={() => remove({ vaultId })}
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

export const UpdateVaultFolderPage = () => {
  const { t } = useTranslation()
  const { mutate, isPending } = useUpdateVaultFolderMutation()
  const { id, name: currentName } = useCurrentVaultFolder()
  const [name, setName] = useState<string>(currentName)
  const navigateBack = useNavigateBack()
  const folders = useVaultFolders()

  const names = useMemo(
    () => folders.filter(folder => folder.id !== id).map(({ name }) => name),
    [folders, id]
  )

  const isDisabled = useMemo(() => {
    if (!name) return t('folder_name_required')

    if (names.includes(name)) return t('folder_name_already_exists')
  }, [name, names, t])

  return (
    <VStack
      as="form"
      {...getFormProps({
        isDisabled,
        isPending,
        onSubmit: () =>
          mutate({ id, fields: { name } }, { onSuccess: navigateBack }),
      })}
      fullHeight
    >
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<DeleteVaultFolder />}
        title={<PageHeaderTitle>{currentName}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent gap={24} scrollable>
        <TextInput
          label={t('folder_name')}
          onValueChange={setName}
          placeholder={t('enter_folder_name')}
          value={name}
        />
        <ManageFolderVaults />
        <AddVaultsToFolder />
      </PageContent>
      <PageFooter>
        <Button isDisabled={isDisabled} isLoading={isPending} type="submit">
          {t('save_changes')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
