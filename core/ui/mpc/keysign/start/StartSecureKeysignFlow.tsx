import { KeysignSigningStep } from '@core/ui/mpc/keysign/KeysignSigningStep'
import { KeysignPeerDiscoveryStep } from '@core/ui/mpc/keysign/peers/KeysignPeerDiscoveryStep'
import { KeysignActionProviderProp } from '@core/ui/mpc/keysign/start/KeysignActionProviderProp'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { KeysignMessagePayloadProvider } from '../state/keysignMessagePayload'

export const StartSecureKeysignFlow = ({
  keysignActionProvider: KeysignActionProvider,
}: KeysignActionProviderProp) => {
  const [{ keysignPayload }] = useCoreViewState<'keysign'>()

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
            value="keysign"
            render={() => (
              <KeysignActionProvider>
                <KeysignMessagePayloadProvider value={keysignPayload}>
                  <KeysignSigningStep onBack={onBack} />
                </KeysignMessagePayloadProvider>
              </KeysignActionProvider>
            )}
          />
        </MpcPeersProvider>
      )}
    />
  )
}
