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

interface InitialState {
  name: string
  vaultIds: string[]
}

export const CreateVaultFolderPage = () => {
  const { t } = useTranslation()
  const initialState: InitialState = {
    name: '',
    vaultIds: [],
  }
  const [state, setState] = useState(initialState)
  const { name, vaultIds } = state
  const navigateBack = useNavigateBack()
  const vaultFolders = useVaultFolders()
  const vaults = useFolderlessVaults()

  const names = useMemo(
    () => vaultFolders.map(({ name }) => name),
    [vaultFolders]
  )

  const isDisabled = useMemo(() => {
    if (!name) {
      return t('folder_name_required')
    }

    if (names.includes(name)) {
      return t('folder_name_already_exists')
    }
  }, [name, t, names])

  const { mutate, isPending } = useCreateVaultFolderMutation()

  return (
    <VStack
      as="form"
      {...getFormProps({
        isDisabled,
        isPending,
        onSubmit: () => {
          mutate(
            {
              name,
              order: getLastItemOrder(vaultFolders.map(({ order }) => order)),
              vaultIds,
            },
            {
              onSuccess: navigateBack,
            }
          )
        },
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
          onValueChange={name =>
            setState(prevState => ({ ...prevState, name }))
          }
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
                      setState(prevState => ({
                        ...prevState,
                        vaultIds: checked
                          ? prevState.vaultIds.filter(id => id !== vaultId)
                          : [...prevState.vaultIds, vaultId],
                      }))
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
