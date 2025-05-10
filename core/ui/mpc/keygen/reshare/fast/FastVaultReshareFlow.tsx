import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
import { ServerEmailStep } from '@core/ui/mpc/keygen/create/fast/server/email/ServerEmailStep'
import { ServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/ServerPasswordStep'
import { SetServerPasswordStep } from '@core/ui/mpc/keygen/create/fast/server/password/SetServerPasswordStep'
import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { KeygenPeerDiscoveryStep } from '@core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep'
import { ReshareVerifyStep } from '@core/ui/mpc/keygen/reshare/verify/ReshareVerifyStep'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { FastVaultReshareServerStep } from './FastVaultReshareServerStep'

const reshareVaultSteps = [
  'email',
  'password',
  'server',
  'peers',
  'verify',
  'keygen',
] as const

export const FastVaultReshareFlow = () => {
  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps: reshareVaultSteps,
    onExit: useNavigateBack(),
  })

  const { signers, localPartyId } = useCurrentVault()

  return (
    <>
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
        server={() => <FastVaultReshareServerStep onFinish={toNextStep} />}
        peers={() => <KeygenPeerDiscoveryStep onFinish={toNextStep} />}
        verify={() => (
          <ReshareVerifyStep onBack={toPreviousStep} onFinish={toNextStep} />
        )}
        keygen={() => (
          <StartMpcSessionFlow
            render={() => <KeygenFlow onBack={() => setStep('verify')} />}
          />
        )}
      />
    </>
  )
}
