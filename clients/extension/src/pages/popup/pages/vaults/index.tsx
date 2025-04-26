import { Button } from '@clients/extension/src/components/button'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { useCurrentVaultId } from '@clients/extension/src/vault/state/currentVaultId'
import { getVaults } from '@clients/extension/src/vault/state/vaults'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { VaultSigners } from '@core/ui/vault/signers'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ListItemTag } from '@lib/ui/list/item/tag'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface InitialState {
  vaults: Vault[]
}

export const VaultsPage = () => {
  const { t } = useTranslation()
  const initialState: InitialState = { vaults: [] }
  const [state, setState] = useState(initialState)
  const { vaults } = state
  const navigate = useAppNavigate()
  const coreNavigate = useCoreNavigate()
  const vault = useCurrentVault()
  const [, setCurrentVaultId] = useCurrentVaultId()
  const handleSelect = (id: string) => {
    setCurrentVaultId(id)
    navigate('main')
  }

  useEffect(() => {
    const initComponent = async () => {
      const vaults = await getVaults()
      setState(prevState => ({ ...prevState, vaults }))
    }
    initComponent()
  }, [])

  return vault ? (
    <VStack fullHeight>
      <PageHeader
        hasBorder
        primaryControls={
          <Button onClick={() => navigate('settings')} ghost>
            <ChevronLeftIcon height={20} width={20} />
          </Button>
        }
        title={
          <Text color="contrast" size={18} weight={500}>
            {t('choose_vault')}
          </Text>
        }
      />
      <PageContent gap={24} flexGrow fullWidth scrollable>
        {vault && (
          <List bordered>
            <ListItem
              title={vault.name}
              extra={<ListItemTag status="success" title={t('active')} />}
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
                    key={getVaultId(v)}
                    title={v.name}
                    onClick={() => handleSelect(getVaultId(v))}
                    extra={<VaultSigners vault={v} />}
                    hoverable
                    showArrow
                  />
                ))}
            </List>
          </VStack>
        )}
      </PageContent>
      <PageFooter fullWidth>
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
  ) : (
    <></>
  )
}
