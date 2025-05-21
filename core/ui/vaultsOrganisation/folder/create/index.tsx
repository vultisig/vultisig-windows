import {
  useCreateVaultFolderMutation,
  useVaultFolders,
} from '@core/ui/storage/vaultFolders'
import { useFolderlessVaults } from '@core/ui/storage/vaults'
import { VaultSigners } from '@core/ui/vault/signers'
import { getVaultId } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { Switch } from '@lib/ui/inputs/switch'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const CreateVaultFolderPage = () => {
  const { t } = useTranslation()
  const { mutate, isPending } = useCreateVaultFolderMutation()
  const [name, setName] = useState<string>('')
  const [vaultIds, setVaultIds] = useState<string[]>([])
  const navigateBack = useNavigateBack()
  const folders = useVaultFolders()
  const vaults = useFolderlessVaults()

  const names = useMemo(() => folders.map(({ name }) => name), [folders])

  const isDisabled = useMemo(() => {
    if (!name) return t('folder_name_required')

    if (names.includes(name)) return t('folder_name_already_exists')
  }, [name, t, names])

  return (
    <VStack
      as="form"
      {...getFormProps({
        isDisabled,
        isPending,
        onSubmit: () =>
          mutate(
            {
              name,
              order: getLastItemOrder(folders.map(({ order }) => order)),
              vaultIds,
            },
            { onSuccess: navigateBack }
          ),
      })}
      fullHeight
    >
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('create_folder')}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent gap={24} scrollable>
        <TextInput
          label={t('folder_name')}
          onValueChange={setName}
          placeholder={t('enter_folder_name')}
          value={name}
        />
        {vaults.length ? (
          <VStack gap={12}>
            <Text color="light" size={12} weight={500}>
              {t('add_vaults_to_folder')}
            </Text>
            <List>
              {vaults.map(vault => {
                const vaultId = getVaultId(vault)
                const checked = vaultIds.includes(vaultId)

                return (
                  <ListItem
                    extra={
                      <>
                        <VaultSigners vault={vault} />
                        <Switch checked={checked} />
                      </>
                    }
                    key={vaultId}
                    onClick={() =>
                      setVaultIds(prevVaultIds =>
                        checked
                          ? prevVaultIds.filter(id => id !== vaultId)
                          : [...prevVaultIds, vaultId]
                      )
                    }
                    title={vault.name}
                    hoverable
                  />
                )
              })}
            </List>
          </VStack>
        ) : null}
      </PageContent>
      <PageFooter>
        <Button isDisabled={isDisabled} isLoading={isPending} type="submit">
          {t('create')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
