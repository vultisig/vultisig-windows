import { Button } from '@clients/extension/src/components/button'
import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { useCurrentVaultId } from '@clients/extension/src/vault/state/currentVaultId'
import { getVaults } from '@clients/extension/src/vault/state/vaults'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { VaultActive } from '@core/ui/vault/active'
import { VaultSigners } from '@core/ui/vault/signers'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface InitialState {
  vaults: Vault[]
}

const Component = () => {
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
    <VStack alignItems="center" justifyContent="center" fullHeight>
      <PageHeader
        hasBorder
        primaryControls={
          <PageHeaderIconButton
            onClick={() => navigate('settings')}
            icon={<ChevronLeftIcon />}
          />
        }
        title={<PageHeaderTitle>{t('choose_vault')}</PageHeaderTitle>}
      />
      <PageContent gap={24} fullWidth scrollable>
        {vault && (
          <List bordered>
            <ListItem title={vault.name} extra={<VaultActive />} />
          </List>
        )}
        {vaults.length > 1 && (
          <VStack gap={12}>
            <Text weight={500} size={12} color="light">
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
        <Button
          onClick={() => coreNavigate('importVault')}
          shape="round"
          size="large"
          type="primary"
          block
        >
          {t('add_new_vault')}
        </Button>
      </PageContent>
    </VStack>
  ) : (
    <></>
  )
}

export default Component
