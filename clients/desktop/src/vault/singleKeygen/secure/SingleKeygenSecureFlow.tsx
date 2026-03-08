import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { KeygenPeerDiscoveryStep } from '@core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { useCore } from '@core/ui/state/core'
import { StepTransition } from '@lib/ui/base/StepTransition'

export const SingleKeygenSecureFlow = () => {
  const { goBack } = useCore()

  return (
    <StepTransition
      from={({ onFinish }) => (
        <KeygenPeerDiscoveryStep onFinish={onFinish} onBack={goBack} />
      )}
      to={({ onBack }) => (
        <StartMpcSessionFlow
          render={() => <KeygenFlow onBack={onBack} />}
          value="keygen"
        />
      )}
    />
  )
}
