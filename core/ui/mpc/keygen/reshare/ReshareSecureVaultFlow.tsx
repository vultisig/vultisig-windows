import { KeygenPeerDiscoveryStep } from '@core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep'
import { StepTransition } from '@lib/ui/base/StepTransition'

import { ReshareKeygenFlow } from './ReshareKeygenFlow'

export const ReshareSecureVaultFlow = () => {
  return (
    <StepTransition
      from={({ onFinish }) => <KeygenPeerDiscoveryStep onFinish={onFinish} />}
      to={({ onBack }) => <ReshareKeygenFlow onBack={onBack} />}
    />
  )
}
