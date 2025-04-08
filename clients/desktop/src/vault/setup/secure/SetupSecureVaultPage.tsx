import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { KeygenFlow } from '../../keygen/shared/KeygenFlow'
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep'
import { KeygenPeerDiscoveryStep } from '../../keygen/shared/peerDiscovery/KeygenPeerDiscoveryStep'
import { SetupVaultNameStep } from '../SetupVaultNameStep'
import { CreateVaultFlowProviders } from '../shared/CreateVaultFlowProviders'
import { VaultTypeProvider } from '../shared/state/vaultType'

const steps = ['name', 'peers', 'startSession', 'keygen'] as const

const lastEditableStep = steps[0]

export const SetupSecureVaultPage = () => {
  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps,
    onExit: useNavigateBack(),
  })

  return (
    <VaultTypeProvider value="secure">
      <CreateVaultFlowProviders>
        <MpcMediatorManager />
        <Match
          value={step}
          name={() => <SetupVaultNameStep onForward={toNextStep} />}
          peers={() => (
            <KeygenPeerDiscoveryStep
              onBack={() => setStep(steps[0])}
              onForward={toNextStep}
            />
          )}
          startSession={() => (
            <KeygenStartSessionStep
              onBack={toPreviousStep}
              onForward={toNextStep}
            />
          )}
          keygen={() => <KeygenFlow onBack={() => setStep(lastEditableStep)} />}
        />
      </CreateVaultFlowProviders>
    </VaultTypeProvider>
  )
}
