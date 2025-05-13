import { KeysignSigningStep } from '@core/ui/mpc/keysign/KeysignSigningStep'
import { KeysignPeerDiscoveryStep } from '@core/ui/mpc/keysign/peers/KeysignPeerDiscoveryStep'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { KeysignActionProvider } from '../action/KeysignActionProvider'
import { useRefreshedKeysignPayload } from '../hooks/useRefreshedKeysignPayload'

export const StartSecureKeysignFlow = () => {
  const [{ keysignPayload: potentiallyStaleKeysignPayload }] =
    useCoreViewState<'keysign'>()
  const keysignPayload = useRefreshedKeysignPayload(
    potentiallyStaleKeysignPayload
  )

  return (
    <ValueTransfer<string[]>
      from={({ onFinish }) => (
        <MpcPeersSelectionProvider>
          <KeysignPeerDiscoveryStep
            payload={keysignPayload}
            onFinish={onFinish}
          />
        </MpcPeersSelectionProvider>
      )}
      to={({ onBack, value }) => (
        <MpcPeersProvider value={value}>
          <StartMpcSessionFlow
            render={() => (
              <KeysignActionProvider>
                <KeysignSigningStep payload={keysignPayload} onBack={onBack} />
              </KeysignActionProvider>
            )}
          />
        </MpcPeersProvider>
      )}
    />
  )
}
