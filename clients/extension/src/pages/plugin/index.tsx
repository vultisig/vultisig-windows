import { PluginReshareFlow } from '@core/ui/mpc/keygen/reshare/plugin/PluginReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { StepTransition } from '@lib/ui/base/StepTransition'

import { PluginJoinKeygenUrl } from './PluginJoinKeygenUrl'

export const PluginPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <KeygenOperationProvider value={{ reshare: 'plugin' }}>
        <ReshareVaultKeygenActionProvider>
          <StepTransition
            from={({ onFinish }) => <PluginJoinKeygenUrl onFinish={onFinish} />}
            to={() => <PluginReshareFlow />}
          />
        </ReshareVaultKeygenActionProvider>
      </KeygenOperationProvider>
    </ReshareVaultFlowProviders>
  )
}
