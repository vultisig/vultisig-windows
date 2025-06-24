import {
  PluginMetadata,
  PluginReshareFlow,
} from '@core/ui/mpc/keygen/reshare/plugin/PluginReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { PluginJoinKeygenUrl } from './PluginJoinKeygenUrl'

export const PluginPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <KeygenOperationProvider value={{ reshare: 'plugin' }}>
        <ReshareVaultKeygenActionProvider>
          <ValueTransfer<PluginMetadata>
            from={({ onFinish }) => <PluginJoinKeygenUrl onFinish={onFinish} />}
            to={({ value }) => <PluginReshareFlow value={value} />}
          />
        </ReshareVaultKeygenActionProvider>
      </KeygenOperationProvider>
    </ReshareVaultFlowProviders>
  )
}
