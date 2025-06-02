import { useAddVaultSessionMutation } from '@clients/extension/src/sessions/mutations/useAddVaultSessionMutation'
import {
  getDappHost,
  getDappHostname,
} from '@clients/extension/src/utils/connectedApps'
import { getStoredRequest } from '@clients/extension/src/utils/storage'
import { Chain, CosmosChain, EvmChain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCosmosChainId } from '@core/chain/chains/cosmos/chainInfo'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'
import { useSetCurrentVaultIdMutation } from '@core/ui/storage/currentVaultId'
import { useVaults } from '@core/ui/storage/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface InitialState {
  chain?: Chain
  sender?: string
}

export const ConnectDAppPage = () => {
  const { t } = useTranslation()
  const [vaultId, setVaultId] = useState<string | undefined>(undefined)
  const initialState: InitialState = {}
  const [state, setState] = useState(initialState)
  const { sender, chain } = state
  const vaults = useVaults()
  const { mutateAsync: addSession } = useAddVaultSessionMutation()
  const { mutateAsync: setCurrentVaultId } = useSetCurrentVaultIdMutation()

  const handleClose = () => {
    window.close()
  }

  const handleSubmit = async () => {
    if (!vaultId || !sender || !chain) return

    let chainId: string | undefined = undefined

    if (getChainKind(chain) === 'evm') {
      chainId = `0x${getEvmChainId(chain as EvmChain).toString(16)}`
    } else if (getChainKind(chain) === 'cosmos') {
      chainId = getCosmosChainId(chain as CosmosChain)
    }

    await setCurrentVaultId(vaultId)

    await addSession({
      vaultId: vaultId,
      session: {
        host: getDappHostname(sender),
        url: getDappHost(sender),
        chainIds: chainId ? [chainId] : undefined,
        selectedCosmosChainId:
          getChainKind(chain) === 'cosmos' ? chainId : undefined,
        selectedEVMChainId: getChainKind(chain) === 'evm' ? chainId : undefined,
      },
    })

    handleClose()
  }

  useEffect(() => {
    const initRequest = async () => {
      try {
        const { chain, sender } = await getStoredRequest()
        setState(prevState => ({ ...prevState, chain, sender }))
      } catch (error) {
        console.error('Failed to get stored request:', error)
      }
    }
    initRequest()
  }, [])

  return vaults.length ? (
    <VStack fullHeight>
      <PageHeader
        secondaryControls={
          <IconButton
            icon={<CrossIcon fontSize={20} />}
            onClick={handleClose}
            size="m"
          />
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
        <Button onClick={handleSubmit} kind="primary">
          {t('connect')}
        </Button>
      </PageFooter>
    </VStack>
  ) : (
    <></>
  )
}
