import {
  useCreateVaultFolderMutation,
  useVaultFolders,
} from '@core/ui/storage/vaultFolders'
import { useFolderlessVaults } from '@core/ui/storage/vaults'
import { NonEmptyOnly } from '@lib/ui/base/NonEmptyOnly'
import { Button } from '@lib/ui/buttons/Button'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FolderVaultsInput } from '../../folder/addVaults/FolderVaultsInput'

export const CreateVaultFolderPage = () => {
  const { t } = useTranslation()
  const goBack = useNavigateBack()
  const [name, setName] = useState('')
  const [vaultIds, setVaultIds] = useState<string[]>([])
  const folders = useVaultFolders()

  const names = useMemo(() => folders.map(({ name }) => name), [folders])

  const vaults = useFolderlessVaults()

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
    <>
      <FlowPageHeader
        title={t('create_folder')}
        data-testid="create-vault-folder-page"
      />
      <VStack
        as="form"
        flexGrow
        style={{ height: '90%' }}
        {...getFormProps({
          isDisabled,
          isPending,
          onSubmit: () => {
            mutate(
              {
                name,
                order: getLastItemOrder(folders.map(({ order }) => order)),
                vaultIds,
              },
              {
                onSuccess: goBack,
              }
            )
          },
        })}
      >
        <PageContent gap={20} scrollable>
          <TextInput
            placeholder={t('enter_folder_name')}
            label={t('folder_name')}
            value={name}
            onValueChange={setName}
          />
          <NonEmptyOnly
            value={vaults}
            render={options => (
              <FolderVaultsInput
                options={options}
                value={vaultIds}
                onChange={setVaultIds}
              />
            )}
          />
          <div style={{ height: 1000 }} />
        </PageContent>
        <PageFooter>
          <Button isLoading={isPending} type="submit" isDisabled={isDisabled}>
            {t('create')}
          </Button>
        </PageFooter>
      </VStack>
    </>
  )
}
