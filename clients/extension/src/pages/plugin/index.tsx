import { FastVaultReshareFlow } from '@core/ui/mpc/keygen/reshare/fast/FastVaultReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { CurrentKeygenOperationTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

import { PluginJoinKeygenUrl } from './PluginJoinKeygenUrl'
import { StepTransition } from '@lib/ui/base/StepTransition'

export const PluginPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <EmailProvider initialValue="">
        <PasswordProvider initialValue="">
          <CurrentKeygenOperationTypeProvider
            value={{ operation: 'reshare', type: 'plugin' }}
          >
            <StepTransition
              from={({ onFinish }) => (
                <PluginJoinKeygenUrl onFinish={onFinish} />
              )}
              to={() => <FastVaultReshareFlow isPluginReshare={true} />}
            />
          </CurrentKeygenOperationTypeProvider>
        </PasswordProvider>
      </EmailProvider>
    </ReshareVaultFlowProviders>
  )
}
