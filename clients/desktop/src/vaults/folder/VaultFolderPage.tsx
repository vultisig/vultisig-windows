import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { useFolderVaults } from '@core/ui/vault/state/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { EditIcon } from '@lib/ui/icons/EditIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'

import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { VaultListItem } from '../components/VaultListItem'
import { useCurrentVaultFolder } from './state/currentVaultFolder'

export const VaultFolderPage = () => {
  const navigate = useCoreNavigate()
  const appNavigate = useAppNavigate()
  const { id, name } = useCurrentVaultFolder()

  const vaults = useFolderVaults(id)

  return (
    <>
      <PageHeader
        hasBorder
        primaryControls={
          <PageHeaderBackButton onClick={() => navigate('vaults')} />
        }
        secondaryControls={
          <PageHeaderIconButton
            icon={<EditIcon />}
            onClick={() => appNavigate('manageVaultFolder', { params: { id } })}
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
