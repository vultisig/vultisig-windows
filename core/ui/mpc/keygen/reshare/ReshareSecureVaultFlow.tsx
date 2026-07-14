import { KeygenPeerDiscoveryStep } from '@core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { useState } from 'react'

import { StartMpcSessionFlow } from '../../session/StartMpcSessionFlow'
import { KeygenFlow } from '../flow/KeygenFlow'
import { TargetDeviceCountProvider } from '../state/targetDeviceCount'
import { ReshareDeviceCountStep } from './ReshareDeviceCountStep'

export const ReshareSecureVaultFlow = () => {
  const [deviceCount, setDeviceCount] = useState<number>()

  if (deviceCount === undefined) {
    return <ReshareDeviceCountStep onFinish={setDeviceCount} />
  }

  return (
    <TargetDeviceCountProvider value={deviceCount}>
      <StepTransition
        from={({ onFinish }) => (
          <KeygenPeerDiscoveryStep
            onFinish={onFinish}
            onBack={() => setDeviceCount(undefined)}
          />
        )}
        to={({ onBack }) => (
          <StartMpcSessionFlow
            value="keygen"
            render={() => <KeygenFlow onBack={onBack} />}
          />
        )}
      />
    </TargetDeviceCountProvider>
  )
}
