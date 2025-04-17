import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { KeygenPeerDiscoveryStep } from '@core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep'
import { StartMpcSessionStep } from '@core/ui/mpc/session/StartMpcSessionStep'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep'
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
        email={() => <ServerEmailStep onFinish={toNextStep} />}
        password={() =>
          hasServer(signers) && !isServer(localPartyId) ? (
            <ServerPasswordStep onFinish={toNextStep} />
          ) : (
            <SetServerPasswordStep onFinish={toNextStep} />
          )
        }
        server={() => <KeygenServerStep onFinish={toNextStep} />}
        joinSession={() => <JoinKeygenSessionStep onFinish={toNextStep} />}
        peers={() => <KeygenPeerDiscoveryStep onFinish={toNextStep} />}
        verify={() => (
          <ReshareVerifyStep onBack={toPreviousStep} onFinish={toNextStep} />
        )}
        startSession={() => (
          <StartMpcSessionStep onBack={toPreviousStep} onFinish={toNextStep} />
        )}
        keygen={() => <KeygenFlow onBack={() => setStep('verify')} />}
      />
    </>
  )
}
