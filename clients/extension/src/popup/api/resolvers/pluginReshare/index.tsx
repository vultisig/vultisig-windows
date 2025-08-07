import { PluginReshareFlow } from '@core/ui/mpc/keygen/reshare/plugin/PluginReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { StepTransition } from '@lib/ui/base/StepTransition'

import { PluginJoinKeygenUrl } from '../../../../pages/plugin/PluginJoinKeygenUrl'
import { PopupApiResolver } from '../../resolver'

export const PluginReshare: PopupApiResolver<'pluginReshare'> = ({
  onFinish,
  input: { pluginName },
}) => {
  return (
    <ReshareVaultFlowProviders>
      <KeygenOperationProvider value={{ reshare: 'plugin' }}>
        <ReshareVaultKeygenActionProvider>
          <StepTransition
            from={({ onFinish: onNextStep }) => (
              <PluginJoinKeygenUrl
                onFinish={joinUrl => {
                  onFinish({ data: { joinUrl } })
                  onNextStep()
                }}
              />
            )}
            to={() => <PluginReshareFlow name={pluginName} />}
          />
        </ReshareVaultKeygenActionProvider>
      </KeygenOperationProvider>
    </ReshareVaultFlowProviders>
  )
}
