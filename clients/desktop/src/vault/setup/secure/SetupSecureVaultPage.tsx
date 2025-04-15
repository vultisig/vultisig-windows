import { CreateVaultFlowProviders } from '@core/ui/mpc/keygen/create/CreateVaultFlowProviders'
import { CreateVaultNameStep } from '@core/ui/mpc/keygen/create/CreateVaultNameStep'
import { VaultSecurityTypeProvider } from '@core/ui/mpc/keygen/create/state/vaultSecurityType'
import { KeygenPeerDiscoveryStep } from '@core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep'
import { StartMpcSessionStep } from '@core/ui/mpc/session/StartMpcSessionStep'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { CreateVaultKeygenActionProvider } from '../../keygen/create/CreateVaultKeygenActionProvider'
import { KeygenFlow } from '../../keygen/shared/KeygenFlow'

const steps = ['name', 'peers', 'startSession', 'keygen'] as const

const lastEditableStep = steps[0]

export const SetupSecureVaultPage = () => {
  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps,
    onExit: useNavigateBack(),
  })

  return (
    <VaultSecurityTypeProvider value="secure">
      <CreateVaultFlowProviders>
        <CreateVaultKeygenActionProvider>
          <MpcMediatorManager />
          <Match
            value={step}
            name={() => <CreateVaultNameStep onFinish={toNextStep} />}
            peers={() => (
              <KeygenPeerDiscoveryStep
                onBack={() => setStep(steps[0])}
                onFinish={toNextStep}
              />
            )}
            startSession={() => (
              <StartMpcSessionStep
                onBack={toPreviousStep}
                onFinish={toNextStep}
              />
            )}
            keygen={() => (
              <KeygenFlow onBack={() => setStep(lastEditableStep)} />
            )}
          />
        </CreateVaultKeygenActionProvider>
      </CreateVaultFlowProviders>
    </VaultSecurityTypeProvider>
  )
}
