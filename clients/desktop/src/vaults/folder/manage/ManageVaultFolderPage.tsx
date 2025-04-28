import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { PageFooter } from '../../../ui/page/PageFooter'
import { AddVaultsToFolder } from '../../manage/AddVaultsToFolder'
import { useUpdateVaultFolderNameMutation } from '../mutations/useUpdateVaultFoderNameMutation'
import { useCurrentVaultFolder } from '../state/currentVaultFolder'
import { DeleteVaultFolder } from './DeleteVaultFolder'
import { ManageFolderVaults } from './ManageFolderVaults'

export const ManageVaultFolderPage = () => {
  const navigate = useCoreNavigate()
  const appNavigate = useAppNavigate()
  const { id, name: initialName } = useCurrentVaultFolder()
  const [name, setName] = useState(initialName)
  const { t } = useTranslation()

  const { mutateAsync, isPending } = useUpdateVaultFolderNameMutation()

  return (
    <>
      <StyledHeader
        hasBorder
        primaryControls={
          <PageHeaderBackButton onClick={() => navigate('vaults')} />
        }
        secondaryControls={<DeleteVaultFolder />}
        title={<PageHeaderTitle>{name}</PageHeaderTitle>}
      />
      <PageContent data-testid="manage-vault-folder-page" gap={20}>
        <VStack gap={8}>
          <Text weight="500" color="supporting" size={14}>
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
            await mutateAsync({ id, name })
            appNavigate('vaultFolder', { params: { id } })
          }}
          isLoading={isPending}
        >
          <Text color="reversed" size={14} weight="600">
            {t('save_changes')}
          </Text>
        </Button>
      </PageFooter>
    </>
  )
}

const StyledHeader = styled(PageHeader)`
  flex-shrink: 0;
`
