import { VaultFolders } from '@core/ui/vaultsOrganisation/folders/components/VaultFolders'
import { EditIcon } from '@lib/ui/icons/EditIcon'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'

import { useCoreNavigate } from '../../navigation/hooks/useCoreNavigate'
import { ManageVaultCreation } from './ManageVaultCreation'
import { PageHeaderVaultSettingsPrompt } from './PageHeaderVaultSettingsPrompt'
import { Vaults } from './Vaults'
import { VaultsPageHeaderTitle } from './VaultsPageHeaderTitle'
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
