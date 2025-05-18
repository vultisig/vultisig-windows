import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useUpdateVaultFolderMutation } from '@core/ui/storage/vaultFolders'
import { DeleteVaultFolder } from '@core/ui/vaultsOrganisation/folder/manage/DeleteVaultFolder'
import { ManageFolderVaults } from '@core/ui/vaultsOrganisation/folder/manage/ManageFolderVaults'
import { useCurrentVaultFolder } from '@core/ui/vaultsOrganisation/folder/state/currentVaultFolder'
import { AddVaultsToFolder } from '@core/ui/vaultsOrganisation/manage/AddVaultsToFolder'
import { Button } from '@lib/ui/buttons/Button'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const ManageVaultFolderPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const currentVaultFolder = useCurrentVaultFolder()
  const [name, setName] = useState(currentVaultFolder.name)
  const { mutate, isPending } = useUpdateVaultFolderMutation()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton onClick={() => navigate({ id: 'vaults' })} />
        }
        secondaryControls={<DeleteVaultFolder />}
        title={<PageHeaderTitle>{currentVaultFolder.name}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <VStack gap={8}>
          <Text color="supporting" size={14} weight="500">
            {t('folder_name')}
          </Text>
          <TextInput value={name} onValueChange={setName} />
        </VStack>
        <ManageFolderVaults />
        <AddVaultsToFolder />
      </PageContent>
      <PageFooter>
        <Button
          onClick={async () => {
            mutate(
              {
                id: currentVaultFolder.id,
                fields: { name },
              },
              {
                onSuccess: () =>
                  navigate({
                    id: 'vaultFolder',
                    state: { id: currentVaultFolder.id },
                  }),
              }
            )
          }}
          isLoading={isPending}
        >
          <Text color="reversed" size={14} weight="600">
            {t('save_changes')}
          </Text>
        </Button>
      </PageFooter>
    </VStack>
  )
}
