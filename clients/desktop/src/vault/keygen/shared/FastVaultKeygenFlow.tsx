import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep'
import { KeygenFlow } from '../../keygen/shared/KeygenFlow'
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep'
import { KeygenPeerDiscoveryStep } from '../../keygen/shared/peerDiscovery/KeygenPeerDiscoveryStep'
import { ReshareVerifyStep } from '../../reshare/shared/ReshareVerifyStep'
import { ServerEmailStep } from '../../server/email/ServerEmailStep'
import { ServerPasswordStep } from '../../server/password/ServerPasswordStep'
import { SetServerPasswordStep } from '../../server/password/SetServerPasswordStep'
import { KeygenServerStep } from './KeygenServerStep'

const reshareVaultSteps = [
  'email',
  'password',
  'joinSession',
  'server',
  'peers',
  'verify',
  'startSession',
  'keygen',
] as const

export const FastVaultKeygenFlow = () => {
  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps: reshareVaultSteps,
    onExit: useNavigateBack(),
  })

  const { signers, localPartyId } = useCurrentVault()

  return (
    <>
      <MpcMediatorManager />
      <Match
        value={step}
        email={() => <ServerEmailStep onForward={toNextStep} />}
        password={() =>
          hasServer(signers) && !isServer(localPartyId) ? (
            <ServerPasswordStep onForward={toNextStep} />
          ) : (
            <SetServerPasswordStep onForward={toNextStep} />
          )
        }
        server={() => <KeygenServerStep onFinish={toNextStep} />}
        joinSession={() => <JoinKeygenSessionStep onForward={toNextStep} />}
        peers={() => <KeygenPeerDiscoveryStep onForward={toNextStep} />}
        verify={() => (
          <ReshareVerifyStep onBack={toPreviousStep} onForward={toNextStep} />
        )}
        startSession={() => (
          <KeygenStartSessionStep
            onBack={toPreviousStep}
            onForward={toNextStep}
          />
        )}
        keygen={() => <KeygenFlow onBack={() => setStep('verify')} />}
      />
    </>
  )
}
