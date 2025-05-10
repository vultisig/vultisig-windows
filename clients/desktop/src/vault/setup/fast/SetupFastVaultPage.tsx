import { CreateVaultFlowProviders } from '@core/ui/mpc/keygen/create/CreateVaultFlowProviders'
import { CreateVaultNameStep } from '@core/ui/mpc/keygen/create/CreateVaultNameStep'
import { SetupVaultServerStep } from '@core/ui/mpc/keygen/create/fast/SetupVaultServerStep'
import { VaultSecurityTypeProvider } from '@core/ui/mpc/keygen/create/state/vaultSecurityType'
import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'
import { ServerEmailStep } from '@core/ui/vault/server/email/ServerEmailStep'
import { SetServerPasswordStep } from '@core/ui/vault/server/password/SetServerPasswordStep'
import { ServerPasswordHintStep } from '@core/ui/vault/server/password-hint/ServerPasswordHintStep'
import { PasswordHintProvider } from '@core/ui/vault/server/password-hint/state/password-hint'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { CreateVaultKeygenActionProvider } from '../../keygen/create/CreateVaultKeygenActionProvider'

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
