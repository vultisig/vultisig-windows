import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import {
  useCurrentVaultId,
  useSetCurrentVaultIdMutation,
} from '@core/ui/storage/currentVaultId'
import { useVaultFolders } from '@core/ui/storage/vaultFolders'
import { useFolderlessVaults } from '@core/ui/storage/vaults'
import { VaultSigners } from '@core/ui/vault/signers'
import { getVaultId } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { SquarePenIcon } from '@lib/ui/icons/SquarePenIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ListItemTag } from '@lib/ui/list/item/tag'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const VaultsPage = () => {
  const { t } = useTranslation()
  const { mutate } = useSetCurrentVaultIdMutation()
  const navigate = useCoreNavigate()
  const folders = useVaultFolders()
  const vaults = useFolderlessVaults()
  const currentVaultId = useCurrentVaultId()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <PageHeaderIconButton
            icon={<SquarePenIcon />}
            onClick={() => navigate({ id: 'manageVaults' })}
          />
        }
        title={<PageHeaderTitle>{t('vaults')}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        {folders.length ? (
          <VStack gap={12}>
            <Text color="light" size={12} weight={500}>
              {t('folders')}
            </Text>
            <List>
              {folders.map(({ id, name }) => (
                <ListItem
                  key={id}
                  onClick={() => navigate({ id: 'vaultFolder', state: { id } })}
                  title={name}
                  hoverable
                  showArrow
                />
              ))}
            </List>
          </VStack>
        ) : null}
        {vaults.length ? (
          <VStack gap={12}>
            <Text color="light" size={12} weight={500}>
              {t('vaults')}
            </Text>
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
                    onClick={() =>
                      mutate(vaultId, {
                        onSuccess: () => navigate({ id: 'vault' }),
                      })
                    }
                    title={vault.name}
                    hoverable
                  />
                )
              })}
            </List>
          </VStack>
        ) : null}
      </PageContent>
      <PageFooter>
        <Button onClick={() => navigate({ id: 'newVault' })}>
          {t('add_new_vault')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
