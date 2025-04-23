import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { ChevronLeftIcon } from '@lib/ui/icons/ChevronLeftIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ListItemExtraActive } from '@lib/ui/list/item/extra/active'
import { ListItemExtraDevices } from '@lib/ui/list/item/extra/devices'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultId } from '../../../../vault/state/currentVaultId'
import { getVaults } from '../../../../vault/state/vaults'

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
    const componentDidMount = async () => {
      const vaults = await getVaults()
      setState(prevState => ({ ...prevState, vaults }))
    }
    componentDidMount()
  }, [])

  return vault ? (
    <>
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
      <PageContent gap={20} scrollable>
        {vault && (
          <List bordered>
            <ListItem title={vault.name} extra={<ListItemExtraActive />} />
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
                    extra={<ListItemExtraDevices total={3} secure />}
                    hoverable
                    showArrow
                  />
                ))}
            </List>
          </VStack>
        )}
        <Button onClick={() => coreNavigate('importVault')} kind="primary">
          {t('add_new_vault')}
        </Button>
      </PageContent>
    </>
  ) : (
    <></>
  )
}

export default Component
