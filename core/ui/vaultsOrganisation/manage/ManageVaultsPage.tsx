import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { FinishEditing } from '@core/ui/vaultsOrganisation/components/FinishEditing'
import { VaultsPageHeaderTitle } from '@core/ui/vaultsOrganisation/components/VaultsPageHeaderTitle'
import { Button } from '@lib/ui/buttons/Button'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useTranslation } from 'react-i18next'

import { PageHeaderVaultSettingsPrompt } from '../components/PageHeaderVaultSettingsPrompt'
import { ManageVaultFolders } from '../folders/manage/ManageVaultFolders'
import { ManageVaults } from './ManageVaults'
export const ManageVaultsPage = () => {
  const navigate = useCoreNavigate()
  const appNavigate = useCoreNavigate()
  const { t } = useTranslation()

  return (
    <>
      <PageHeader
        hasBorder
        primaryControls={<PageHeaderVaultSettingsPrompt />}
        secondaryControls={
          <FinishEditing onClick={() => navigate({ id: 'vaults' })} />
        }
        title={<VaultsPageHeaderTitle />}
      />
      <PageContent scrollable gap={20}>
        <ManageVaultFolders />
        <ManageVaults />
      </PageContent>
      <PageFooter>
        <Button
          kind="outlined"
          onClick={() => appNavigate({ id: 'createVaultFolder' })}
        >
          {t('create_folder')}
        </Button>
      </PageFooter>
    </>
  )
}
