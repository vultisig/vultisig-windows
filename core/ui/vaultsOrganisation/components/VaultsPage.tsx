import { EditIcon } from '@lib/ui/icons/EditIcon'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'

import { PageFooter } from '@lib/ui/page/PageFooter'
import { VaultFolders } from '@core/ui/vaultsOrganisation/folders/components/VaultFolders'
import { ManageVaultCreation } from './ManageVaultCreation'
import { Vaults } from './Vaults'
import { VaultsPageHeaderTitle } from './VaultsPageHeaderTitle'
import { useCoreNavigate } from '../../navigation/hooks/useCoreNavigate'
import { PageHeaderVaultSettingsPrompt } from './PageHeaderVaultSettingsPrompt'
export const VaultsPage = () => {
  const navigate = useCoreNavigate()

  return (
    <>
      <PageHeader
        hasBorder
        primaryControls={<PageHeaderVaultSettingsPrompt />}
        secondaryControls={
          <PageHeaderIconButton
            icon={<EditIcon />}
            onClick={() => navigate({ id: 'manageVaults' })}
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
