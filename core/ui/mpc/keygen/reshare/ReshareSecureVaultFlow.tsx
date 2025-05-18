import { KeygenPeerDiscoveryStep } from '@core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep'
import { StepTransition } from '@lib/ui/base/StepTransition'

import { StartMpcSessionFlow } from '../../session/StartMpcSessionFlow'
import { KeygenFlow } from '../flow/KeygenFlow'
import { ReshareVerifyStep } from './verify/ReshareVerifyStep'

export const ReshareSecureVaultFlow = () => {
  return (
    <StepTransition
      from={({ onFinish }) => <KeygenPeerDiscoveryStep onFinish={onFinish} />}
      to={({ onBack }) => (
        <StepTransition
          from={({ onFinish }) => (
            <ReshareVerifyStep onBack={onBack} onFinish={onFinish} />
          )}
          to={({ onBack }) => (
            <StartMpcSessionFlow
              value="keygen"
              render={() => <KeygenFlow onBack={onBack} />}
            />
          )}
        />
      )}
    />
  )
}
