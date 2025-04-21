import { KeysignPeerDiscoveryStep } from '@core/ui/mpc/keysign/peers/KeysignPeerDiscoveryStep'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { StepTransition } from '@lib/ui/base/StepTransition'

import { KeysignSigningStep } from '../shared/KeysignSigningStep'

export const StartSecureKeysignFlow = () => {
  const { keysignPayload } = useCorePathState<'keysign'>()

  return (
    <MpcPeersSelectionProvider>
      <StepTransition
        from={({ onFinish }) => (
          <KeysignPeerDiscoveryStep onFinish={onFinish} />
        )}
        to={({ onBack }) => (
          <StartMpcSessionFlow
            render={() => (
              <KeysignSigningStep payload={keysignPayload} onBack={onBack} />
            )}
          />
        )}
      />
    </MpcPeersSelectionProvider>
  )
}
