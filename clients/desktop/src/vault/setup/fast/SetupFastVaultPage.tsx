import { VaultSecurityTypeProvider } from '@core/ui/mpc/keygen/create/state/vaultSecurityType'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { KeygenFlow } from '../../keygen/shared/KeygenFlow'
import { ServerEmailStep } from '../../server/email/ServerEmailStep'
import { EmailProvider } from '../../server/email/state/email'
import { SetServerPasswordStep } from '../../server/password/SetServerPasswordStep'
import { PasswordProvider } from '../../server/password/state/password'
import { ServerPasswordHintStep } from '../../server/password-hint/ServerPasswordHintStep'
import { PasswordHintProvider } from '../../server/password-hint/state/password-hint'
import { SetupVaultNameStep } from '../SetupVaultNameStep'
import { CreateVaultFlowProviders } from '../shared/CreateVaultFlowProviders'
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
              <MpcMediatorManager />
              <Match
                value={step}
                name={() => <SetupVaultNameStep onForward={toNextStep} />}
                email={() => (
                  <ServerEmailStep
                    onBack={toPreviousStep}
                    onForward={toNextStep}
                  />
                )}
                password={() => (
                  <SetServerPasswordStep
                    onBack={toPreviousStep}
                    onForward={toNextStep}
                  />
                )}
                hint={() => (
                  <ServerPasswordHintStep
                    onBack={toPreviousStep}
                    onForward={toNextStep}
                  />
                )}
                setupForCreateVault={() => (
                  <SetupVaultServerStep
                    onBack={() => setStep(lastEditableStep)}
                    onForward={toNextStep}
                  />
                )}
                createVault={() => (
                  <KeygenFlow onBack={() => setStep(lastEditableStep)} />
                )}
              />
            </CreateVaultFlowProviders>
          </PasswordHintProvider>
        </PasswordProvider>
      </EmailProvider>
    </VaultSecurityTypeProvider>
  )
}
