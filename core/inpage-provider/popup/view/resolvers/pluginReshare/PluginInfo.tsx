import { PopupDeadEnd } from '@core/inpage-provider/popup/view/flow/PopupDeadEnd'
import { PluginReshareFlow } from '@core/ui/mpc/keygen/reshare/plugin/PluginReshareFlow'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { getPlugin } from '@core/ui/plugins/core/get'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { StrictText } from '@lib/ui/text'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { PluginReshareVaultFlowProviders } from './PluginReshareVaultFlowProviders'

export const PluginInfo = ({
  input: {
    pluginId,
    pluginMarketplaceBaseUrl,
    dAppSessionId,
    encryptionKeyHex,
  },
  onFinish,
}: OnFinishProp<boolean> & {
  input: {
    pluginId: string
    pluginMarketplaceBaseUrl: string
    dAppSessionId: string
    encryptionKeyHex: string
  }
}) => {
  const { t } = useTranslation()
  const query = useQuery({
    queryKey: [pluginId, pluginMarketplaceBaseUrl],
    queryFn: () => getPlugin(pluginMarketplaceBaseUrl, pluginId),
  })

  return (
    <MatchQuery
      value={query}
      success={plugin => (
        <PluginReshareVaultFlowProviders
          dAppSessionId={dAppSessionId}
          encryptionKeyHex={encryptionKeyHex}
        >
          <KeygenOperationProvider value={{ reshare: 'plugin' }}>
            <ReshareVaultKeygenActionProvider>
              <PluginReshareFlow plugin={plugin} onFinish={onFinish} />
            </ReshareVaultKeygenActionProvider>
          </KeygenOperationProvider>
        </PluginReshareVaultFlowProviders>
      )}
      pending={() => (
        <PopupDeadEnd>
          <Spinner />
        </PopupDeadEnd>
      )}
      error={() => (
        <Center>
          <StrictText>{t('failed_to_load')}</StrictText>
        </Center>
      )}
    />
  )
}
