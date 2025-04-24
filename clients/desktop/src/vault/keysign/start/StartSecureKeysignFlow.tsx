import { KeysignPeerDiscoveryStep } from '@core/ui/mpc/keysign/peers/KeysignPeerDiscoveryStep'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { KeysignSigningStep } from '../shared/KeysignSigningStep'

export const StartSecureKeysignFlow = () => {
  const { keysignPayload } = useCorePathState<'keysign'>()

  return (
    <MpcPeersSelectionProvider>
      <ValueTransfer<string[]>
        from={({ onFinish }) => (
          <MpcPeersSelectionProvider>
            <KeysignPeerDiscoveryStep onFinish={onFinish} />
          </MpcPeersSelectionProvider>
        )}
        to={({ onBack, value }) => (
          <MpcPeersProvider value={value}>
            <StartMpcSessionFlow
              render={() => (
                <KeysignSigningStep payload={keysignPayload} onBack={onBack} />
              )}
            />
          </MpcPeersProvider>
        )}
      />
    </MpcPeersSelectionProvider>
  )
}
