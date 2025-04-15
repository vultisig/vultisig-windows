import { EditIcon } from '@lib/ui/icons/EditIcon'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'

import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { PageHeaderVaultSettingsPrompt } from '../../pages/vaultSettings/PageHeaderVaultSettingsPrompt'
import { PageFooter } from '../../ui/page/PageFooter'
import { VaultFolders } from '../folders/components/VaultFolders'
import { ManageVaultCreation } from './ManageVaultCreation'
import { Vaults } from './Vaults'
import { VaultsPageHeaderTitle } from './VaultsPageHeaderTitle'

export const VaultsPage = () => {
  const navigate = useAppNavigate()

  return (
    <>
      <PageHeader
        hasBorder
        primaryControls={<PageHeaderVaultSettingsPrompt />}
        secondaryControls={
          <PageHeaderIconButton
            icon={<EditIcon />}
            onClick={() => navigate('manageVaults')}
          />
        }
        title={<VaultsPageHeaderTitle />}
      />
      <PageContent scrollable gap={20}>
        <VaultFolders />
        <Vaults />
      </PageContent>
      <PageFooter>
        <ManageVaultCreation />
      </PageFooter>
    </>
  )
}
