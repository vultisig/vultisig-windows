import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useTranslation } from 'react-i18next'

import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { PageHeaderVaultSettingsPrompt } from '../../pages/vaultSettings/PageHeaderVaultSettingsPrompt'
import { PageFooter } from '../../ui/page/PageFooter'
import { FinishEditing } from '../components/FinishEditing'
import { VaultsPageHeaderTitle } from '../components/VaultsPageHeaderTitle'
import { ManageVaultFolders } from '../folders/manage/ManageVaultFolders'
import { ManageVaults } from './ManageVaults'

export const ManageVaultsPage = () => {
  const navigate = useCoreNavigate()
  const appNavigate = useAppNavigate()
  const { t } = useTranslation()

  return (
    <>
      <PageHeader
        hasBorder
        primaryControls={<PageHeaderVaultSettingsPrompt />}
        secondaryControls={<FinishEditing onClick={() => navigate('vaults')} />}
        title={<VaultsPageHeaderTitle />}
      />
      <PageContent scrollable gap={20}>
        <ManageVaultFolders />
        <ManageVaults />
      </PageContent>
      <PageFooter>
        <Button
          kind="outlined"
          onClick={() => appNavigate('createVaultFolder')}
        >
          {t('create_folder')}
        </Button>
      </PageFooter>
    </>
  )
}
