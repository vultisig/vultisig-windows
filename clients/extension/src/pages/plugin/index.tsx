import { ReshareSecureVaultFlow } from '@core/ui/mpc/keygen/reshare/ReshareSecureVaultFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { ReshareVaultKeygenActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareVaultKeygenActionProvider'
import { CurrentKeygenTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenType'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

import { initializeMessenger } from '../../messengers/initializeMessenger'
import { ServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/ServerPasswordStep'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { Match } from '@lib/ui/base/Match'
import { ServerEmailStep } from '@core/ui/mpc/keygen/create/fast/server/email/ServerEmailStep'
import { ReshareFastKeygenServerActionProvider } from '@core/ui/mpc/keygen/reshare/ReshareFastKeygenServerActionProvider'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { FastKeygenServerActionStep } from '@core/ui/mpc/keygen/fast/FastKeygenServerActionStep'

const backgroundMessenger = initializeMessenger({ connect: 'background' })
const resharePluginSteps = ['email', 'password', 'keygen'] as const
export const PluginPage = () => {
  const { step, toPreviousStep, toNextStep } = useStepNavigation({
    steps: resharePluginSteps,
    onExit: useNavigateBack(),
  })

  const onJoinUrl = async (joinUrl: string) => {
    await backgroundMessenger.send('plugin:reshare', {
      joinUrl,
    })
  }

  return (
    <ReshareVaultFlowProviders>
      <EmailProvider initialValue="">
        <PasswordProvider initialValue="">
          <CurrentKeygenTypeProvider value="plugin">
            <ReshareVaultKeygenActionProvider>
              <Match
                value={step}
                email={() => <ServerEmailStep onFinish={toNextStep} />}
                password={() => <ServerPasswordStep onFinish={toNextStep} />}
                keygen={() => (
                  <StepTransition
                    from={({ onFinish }) => (
                      <ReshareFastKeygenServerActionProvider>
                        <FastKeygenServerActionStep
                          onFinish={onFinish}
                          onBack={toPreviousStep}
                        />
                      </ReshareFastKeygenServerActionProvider>
                    )}
                    to={() => <ReshareSecureVaultFlow onJoinUrl={onJoinUrl} />}
                  />
                )}
              />
            </ReshareVaultKeygenActionProvider>
          </CurrentKeygenTypeProvider>
        </PasswordProvider>
      </EmailProvider>
    </ReshareVaultFlowProviders>
  )
}
