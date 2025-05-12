import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useFolderVaults } from '@core/ui/storage/vaults'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { VaultListItem } from '@core/ui/vaultsOrganisation/components/VaultListItem'
import { EditIcon } from '@lib/ui/icons/EditIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'

import { useCurrentVaultFolder } from './state/currentVaultFolder'

export const VaultFolderPage = () => {
  const navigate = useCoreNavigate()
  const appNavigate = useCoreNavigate()
  const { id, name } = useCurrentVaultFolder()

  const vaults = useFolderVaults(id)

  return (
    <>
      <PageHeader
        hasBorder
        primaryControls={
          <PageHeaderBackButton onClick={() => navigate({ id: 'vaults' })} />
        }
        secondaryControls={
          <PageHeaderIconButton
            icon={<EditIcon />}
            onClick={() =>
              appNavigate({ id: 'manageVaultFolder', state: { id } })
            }
          />
        }
        title={<PageHeaderTitle>{name}</PageHeaderTitle>}
      />
      <PageContent scrollable>
        <VStack gap={8}>
          {vaults.map(vault => (
            <CurrentVaultProvider value={vault} key={getVaultId(vault)}>
              <VaultListItem />
            </CurrentVaultProvider>
          ))}
        </VStack>
      </PageContent>
    </>
  )
}
