import { FastVaultReshareFlow } from '@core/ui/mpc/keygen/reshare/fast/FastVaultReshareFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { CurrentKeygenOperationTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'
import { StepTransition } from '@lib/ui/base/StepTransition'

import { PluginJoinKeygenUrl } from './PluginJoinKeygenUrl'

export const PluginPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <EmailProvider initialValue="">
        <PasswordProvider initialValue="">
          <CurrentKeygenOperationTypeProvider value={{ reshare: 'plugin' }}>
            <StepTransition
              from={({ onFinish }) => (
                <PluginJoinKeygenUrl onFinish={onFinish} />
              )}
              to={() => <FastVaultReshareFlow />}
            />
          </CurrentKeygenOperationTypeProvider>
        </PasswordProvider>
      </EmailProvider>
    </ReshareVaultFlowProviders>
  )
}
