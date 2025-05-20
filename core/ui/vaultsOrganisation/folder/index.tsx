import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import {
  useCurrentVaultId,
  useSetCurrentVaultIdMutation,
} from '@core/ui/storage/currentVaultId'
import { useFolderVaults } from '@core/ui/storage/vaults'
import { VaultSigners } from '@core/ui/vault/signers'
import { getVaultId } from '@core/ui/vault/Vault'
import { useCurrentVaultFolder } from '@core/ui/vaultsOrganisation/folder/state/currentVaultFolder'
import { SquarePenIcon } from '@lib/ui/icons/SquarePenIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ListItemTag } from '@lib/ui/list/item/tag'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { useTranslation } from 'react-i18next'

export const VaultFolderPage = () => {
  const { t } = useTranslation()
  const { mutate } = useSetCurrentVaultIdMutation()
  const { id, name } = useCurrentVaultFolder()
  const navigate = useCoreNavigate()
  const navigateBack = useNavigateBack()
  const currentVaultId = useCurrentVaultId()
  const vaults = useFolderVaults(id)

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <PageHeaderIconButton
            icon={<SquarePenIcon />}
            onClick={() => navigate({ id: 'updateVaultFolder', state: { id } })}
          />
        }
        title={<PageHeaderTitle>{name}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent flexGrow scrollable>
        <List>
          {vaults.map(vault => {
            const vaultId = getVaultId(vault)

            return (
              <ListItem
                key={vaultId}
                extra={
                  <>
                    {vaultId === currentVaultId && (
                      <ListItemTag status="success" title={t('active')} />
                    )}
                    <VaultSigners vault={vault} />
                  </>
                }
                onClick={() => mutate(vaultId, { onSuccess: navigateBack })}
                title={vault.name}
                hoverable
              />
            )
          })}
        </List>
      </PageContent>
    </VStack>
  )
}
