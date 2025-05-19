import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { FinishEditing } from '@core/ui/vaultsOrganisation/components/FinishEditing'
import { VaultsPageHeaderTitle } from '@core/ui/vaultsOrganisation/components/VaultsPageHeaderTitle'
import { Button } from '@lib/ui/buttons/Button'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { useTranslation } from 'react-i18next'

import { ManageVaultFolders } from '../folders/manage/ManageVaultFolders'
import { ManageVaults } from './ManageVaults'

export const ManageVaultsPage = () => {
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  return (
    <>
      <PageHeader
        hasBorder
        primaryControls={
          <PageHeaderIconButton
            onClick={() => navigate({ id: 'settings' })}
            icon={<MenuIcon />}
          />
        }
        secondaryControls={
          <FinishEditing onClick={() => navigate({ id: 'vaults' })} />
        }
        title={<VaultsPageHeaderTitle />}
      />
      <VStack flexGrow style={{ height: '90%' }}>
        <PageContent gap={20} scrollable>
          <ManageVaultFolders />
          <ManageVaults />
        </PageContent>
        <PageFooter>
          <Button
            kind="outlined"
            onClick={() => navigate({ id: 'createVaultFolder' })}
          >
            {t('create_folder')}
          </Button>
        </PageFooter>
      </VStack>
    </>
  )
}
