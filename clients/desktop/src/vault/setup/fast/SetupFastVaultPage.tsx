import { CreateVaultFlowProviders } from '@core/ui/mpc/keygen/create/CreateVaultFlowProviders'
import { CreateVaultNameStep } from '@core/ui/mpc/keygen/create/CreateVaultNameStep'
import { VaultSecurityTypeProvider } from '@core/ui/mpc/keygen/create/state/vaultSecurityType'
import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { CreateVaultKeygenActionProvider } from '../../keygen/create/CreateVaultKeygenActionProvider'
import { ServerEmailStep } from '../../server/email/ServerEmailStep'
import { SetServerPasswordStep } from '../../server/password/SetServerPasswordStep'
import { ServerPasswordHintStep } from '../../server/password-hint/ServerPasswordHintStep'
import { PasswordHintProvider } from '../../server/password-hint/state/password-hint'
import { SetupVaultServerStep } from './SetupVaultServerStep'

const steps = [
  'name',
  'email',
  'password',
  'hint',
  'setupForCreateVault',
  'createVault',
] as const

const lastEditableStep = 'password'

export const SetupFastVaultPage = () => {
  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps,
    onExit: useNavigateBack(),
  })

  return (
    <VaultSecurityTypeProvider value="fast">
      <EmailProvider initialValue="">
        <PasswordProvider initialValue="">
          <PasswordHintProvider initialValue="">
            <CreateVaultFlowProviders>
              <CreateVaultKeygenActionProvider>
                <MpcMediatorManager />
                <Match
                  value={step}
                  name={() => <CreateVaultNameStep onFinish={toNextStep} />}
                  email={() => (
                    <ServerEmailStep
                      onBack={toPreviousStep}
                      onFinish={toNextStep}
                    />
                  )}
                  password={() => (
                    <SetServerPasswordStep
                      onBack={toPreviousStep}
                      onFinish={toNextStep}
                    />
                  )}
                  hint={() => (
                    <ServerPasswordHintStep
                      onBack={toPreviousStep}
                      onFinish={toNextStep}
                    />
                  )}
                  setupForCreateVault={() => (
                    <SetupVaultServerStep
                      onBack={() => setStep(lastEditableStep)}
                      onFinish={toNextStep}
                    />
                  )}
                  createVault={() => (
                    <KeygenFlow onBack={() => setStep(lastEditableStep)} />
                  )}
                />
              </CreateVaultKeygenActionProvider>
            </CreateVaultFlowProviders>
          </PasswordHintProvider>
        </PasswordProvider>
      </EmailProvider>
    </VaultSecurityTypeProvider>
  )
}
