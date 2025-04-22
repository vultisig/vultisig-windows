import { useAppNavigate } from '@clients/extension/src/navigation/hooks/useAppNavigate'
import { Vault } from '@clients/extension/src/utils/interfaces'
import {
  getStoredVaults,
  setStoredVaults,
} from '@clients/extension/src/utils/storage'
import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
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

interface InitialState {
  vault?: Vault
  vaults: Vault[]
}

const Component = () => {
  const { t } = useTranslation()
  const initialState: InitialState = { vaults: [] }
  const [state, setState] = useState(initialState)
  const { vault, vaults } = state
  const navigate = useAppNavigate()

  const handleSelect = (uid: string) => {
    setStoredVaults(
      vaults.map(vault => ({ ...vault, active: vault.uid === uid }))
    ).then(() => {
      navigate('main')
    })
  }

  const componentDidMount = (): void => {
    getStoredVaults().then(vaults => {
      const vault = vaults.find(({ active }) => active)

      setState(prevState => ({ ...prevState, vault, vaults }))
    })
  }

  useEffect(componentDidMount, [])

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
                .filter(({ uid }) => uid !== vault.uid)
                .map(({ localPartyId, name, signers, uid }) => (
                  <ListItem
                    key={uid}
                    title={name}
                    onClick={() => handleSelect(uid)}
                    extra={
                      <ListItemExtraDevices
                        total={signers?.length}
                        secure={!hasServer(signers) || isServer(localPartyId)}
                      />
                    }
                    hoverable
                    showArrow
                  />
                ))}
            </List>
          </VStack>
        )}
        <Button
          onClick={() =>
            navigate('importQR', {
              params: {
                title: t('import_vault'),
              },
            })
          }
          kind="primary"
        >
          {t('add_new_vault')}
        </Button>
      </PageContent>
    </>
  ) : (
    <></>
  )
}

export default Component
