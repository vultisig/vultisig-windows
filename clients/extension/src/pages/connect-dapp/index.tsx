import { useAddVaultSessionMutation } from '@clients/extension/src/sessions/mutations/useAddVaultSessionMutation'
import { useStoredPendingRequestQuery } from '@clients/extension/src/utils/pendingRequests'
import { CosmosChain, EvmChain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getCosmosChainId } from '@core/chain/chains/cosmos/chainInfo'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'
import { useSetCurrentVaultIdMutation } from '@core/ui/storage/currentVaultId'
import { useVaults } from '@core/ui/storage/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getUrlBaseDomain } from '@lib/utils/url/baseDomain'
import { getUrlHost } from '@lib/utils/url/host'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const ConnectDAppPage = () => {
  const { t } = useTranslation()
  const [vaultId, setVaultId] = useState<string | undefined>(undefined)
  const { data } = useStoredPendingRequestQuery('accounts')
  const sender = data?.sender
  const chain = data?.chain
  const vaults = useVaults()
  const { mutateAsync: addSession } = useAddVaultSessionMutation()
  const { mutateAsync: setCurrentVaultId } = useSetCurrentVaultIdMutation()

  const handleClose = () => {
    window.close()
  }

  const handleSubmit = async () => {
    if (!vaultId || !sender || !chain) return

    await setCurrentVaultId(vaultId)

    await addSession({
      vaultId: vaultId,
      session: {
        host: getUrlBaseDomain(sender),
        url: getUrlHost(sender),
        selectedCosmosChainId:
          getChainKind(chain) === 'cosmos'
            ? getCosmosChainId(chain as CosmosChain)
            : undefined,
        selectedEVMChainId:
          getChainKind(chain) === 'evm'
            ? getEvmChainId(chain as EvmChain)
            : undefined,
      },
    })

    handleClose()
  }

  return vaults.length ? (
    <VStack fullHeight>
      <PageHeader
        secondaryControls={
          <IconButton onClick={handleClose}>
            <CrossIcon />
          </IconButton>
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
        <Button onClick={handleSubmit}>{t('connect')}</Button>
      </PageFooter>
    </VStack>
  ) : (
    <PageContent
      alignItems="center"
      gap={12}
      justifyContent="center"
      flexGrow
      scrollable
    >
      <Panel>
        <VStack alignItems="center" gap={24} justifyContent="center">
          <TriangleAlertIcon fontSize={36} />
          <VStack
            alignItems="center"
            gap={16}
            justifyContent="center"
            fullWidth
          >
            <Text size={17} weight={500} centerHorizontally>
              {t('no_vaults')}
            </Text>
            <Text color="light" size={14} weight={500} centerHorizontally>
              {t('no_vaults_desc')}
            </Text>
          </VStack>
        </VStack>
      </Panel>
    </PageContent>
  )
}
