import { VaultFolders } from '@core/ui/vaultsOrganisation/folders/components/VaultFolders'
import { EditIcon } from '@lib/ui/icons/EditIcon'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'

import { useCoreNavigate } from '../../navigation/hooks/useCoreNavigate'
import { ManageVaultCreation } from './ManageVaultCreation'
import { Vaults } from './Vaults'
import { VaultsPageHeaderTitle } from './VaultsPageHeaderTitle'

export const VaultsPage = () => {
  const navigate = useCoreNavigate()

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
