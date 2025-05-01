import { Button } from '@clients/extension/src/components/button'
import { AppProviders } from '@clients/extension/src/providers/AppProviders'
import { useSetCurrentVaultIdMutation } from '@core/ui/storage/currentVaultId'
import { useVaults } from '@core/ui/storage/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { StrictMode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useTranslation } from 'react-i18next'
import { useAddVaultSessionMutation } from '../../sessions/mutations/useAddVaultSessionMutation'
import { getStoredRequest } from '../../utils/storage'
import { Chain } from '@core/chain/Chain'
import { getDappHost, getDappHostname } from '../../utils/connectedApps'
import { getChainId } from '@core/chain/coin/ChainId'

interface InitialState {
  chain?: Chain
  sender?: string
}

const App = () => {
  const { t } = useTranslation()
  const [vaultId, setVaultId] = useState<string | undefined>(undefined)
  const initialState: InitialState = {}
  const [state, setState] = useState(initialState)
  const { sender, chain } = state
  const vaults = useVaults()

  const { mutateAsync: addSession } = useAddVaultSessionMutation()
  const handleClose = () => {
    window.close()
  }

  const handleSubmit = async () => {
    if (!vaultId || !sender || !chain) return
    await addSession({
      vaultId: vaultId,
      session: {
        host: getDappHostname(sender),
        url: getDappHost(sender),
        chainIds: [getChainId(chain)],
      },
    })
    handleClose()
  }

  useEffect(() => {
    const initRequest = async () => {
      const { chain, sender } = await getStoredRequest()
      setState(prevState => ({ ...prevState, chain, sender }))
    }
    initRequest()
  }, [])

  return vaults.length ? (
    <VStack fullHeight>
      <PageHeader
        secondaryControls={
          <Button onClick={handleClose} ghost>
            <CrossIcon fontSize={20} />
          </Button>
        }
        title={
          <Text color="contrast" size={18} weight={500}>
            {t('connect_with_vultisig')}
          </Text>
        }
        hasBorder
      />
      <PageContent gap={24} flexGrow scrollable>
        <List>
          {vaults.map(item => {
            const itemId = getVaultId(item)

            return (
              <ListItem
                extra={<Switch checked={itemId === vaultId} />}
                key={itemId}
                title={item.name}
                onClick={() => setVaultId(itemId)}
                hoverable
              />
            )
          })}
        </List>
      </PageContent>
      <PageFooter>
        <Button
          onClick={handleSubmit}
          shape="round"
          size="large"
          type="primary"
          block
        >
          {t('connect')}
        </Button>
      </PageFooter>
    </VStack>
  ) : (
    <></>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
)
