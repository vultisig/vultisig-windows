import { Button } from '@clients/extension/src/components/button'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useSetCurrentVaultIdMutation } from '@core/ui/vault/mutations/useSetCurrentVaultIdMutation'
import { VaultSigners } from '@core/ui/vault/signers'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useVaults } from '@core/ui/vault/state/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ListItemTag } from '@lib/ui/list/item/tag'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const VaultsPage = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const coreNavigate = useCoreNavigate()
  const vaults = useVaults()
  const vault = useCurrentVault()
  const setCurrentVaultId = useSetCurrentVaultIdMutation()

  const handleSelect = (id: string) => {
    setCurrentVaultId.mutate(id)

    navigate('root')
  }

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <Button onClick={() => navigate('settings')} ghost>
            <ChevronLeftIcon fontSize={20} />
          </Button>
        }
        title={
          <Text color="contrast" size={18} weight={500}>
            {t('choose_vault')}
          </Text>
        }
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        {vault && (
          <List bordered>
            <ListItem
              extra={<ListItemTag status="success" title={t('active')} />}
              title={vault.name}
            />
          </List>
        )}
        {vaults.length > 1 && (
          <VStack gap={12}>
            <Text color="light" size={12} weight={500}>
              {t('other_vaults')}
            </Text>
            <List>
              {vaults
                .filter(v => getVaultId(v) !== getVaultId(vault))
                .map(v => (
                  <ListItem
                    extra={<VaultSigners vault={v} />}
                    key={getVaultId(v)}
                    onClick={() => handleSelect(getVaultId(v))}
                    title={v.name}
                    hoverable
                    showArrow
                  />
                ))}
            </List>
          </VStack>
        )}
      </PageContent>
      <PageFooter>
        <Button
          onClick={() => coreNavigate('importVault')}
          shape="round"
          size="large"
          type="primary"
          block
        >
          {t('add_new_vault')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
