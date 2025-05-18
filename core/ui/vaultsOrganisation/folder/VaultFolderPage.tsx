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
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { useTranslation } from 'react-i18next'

export const VaultFolderPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const currentVaultFolder = useCurrentVaultFolder()
  const currentVaultId = useCurrentVaultId()
  const setCurrentVaultId = useSetCurrentVaultIdMutation()
  const vaults = useFolderVaults(currentVaultFolder.id)

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <PageHeaderIconButton
            icon={<SquarePenIcon />}
            onClick={() =>
              navigate({
                id: 'manageVaultFolder',
                state: { id: currentVaultFolder.id },
              })
            }
          />
        }
        title={<PageHeaderTitle>{currentVaultFolder.name}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent gap={8} flexGrow scrollable>
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
                onClick={() => {
                  setCurrentVaultId.mutate(vaultId, {
                    onSuccess: () => navigate({ id: 'vault' }),
                  })
                }}
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
