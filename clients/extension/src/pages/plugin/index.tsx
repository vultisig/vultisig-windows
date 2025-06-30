import {
  PluginMetadata,
  PluginReshareFlow,
} from '@core/ui/mpc/keygen/reshare/plugin/PluginReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'

import { useStoredPendingRequestQuery } from '../../utils/pendingRequests'
import { PluginJoinKeygenUrl } from './PluginJoinKeygenUrl'

export const PluginPage = () => {
  const requestQuery = useStoredPendingRequestQuery('plugin')

  return (
    <MatchQuery
      value={requestQuery}
      success={pluginRequest => {
        return (
          <Match
            value={pluginRequest.type}
            ReshareRequest={() => (
              <ReshareVaultFlowProviders>
                <KeygenOperationProvider value={{ reshare: 'plugin' }}>
                  <ReshareVaultKeygenActionProvider>
                    <ValueTransfer<PluginMetadata>
                      from={({ onFinish }) => (
                        <PluginJoinKeygenUrl onFinish={onFinish} />
                      )}
                      to={({ value }) => <PluginReshareFlow value={value} />}
                    />
                  </ReshareVaultKeygenActionProvider>
                </KeygenOperationProvider>
              </ReshareVaultFlowProviders>
            )}
          />
        )
      }}
    />
  )
}
