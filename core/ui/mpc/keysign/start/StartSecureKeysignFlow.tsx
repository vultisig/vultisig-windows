import { KeysignConnectingState } from '@core/ui/mpc/keysign/flow/KeysignConnectingState'
import { KeysignSigningStep } from '@core/ui/mpc/keysign/KeysignSigningStep'
import { KeysignPeerDiscoveryStep } from '@core/ui/mpc/keysign/peers/KeysignPeerDiscoveryStep'
import { KeysignActionProviderProp } from '@core/ui/mpc/keysign/start/KeysignActionProviderProp'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { TransactionRecorderProvider } from '../../../transaction-history/record/TransactionRecorderProvider'
import { KeysignMessagePayloadProvider } from '../state/keysignMessagePayload'

const renderConnecting = () => <KeysignConnectingState />

export const StartSecureKeysignFlow = ({
  keysignActionProvider: KeysignActionProvider,
}: KeysignActionProviderProp) => {
  const [{ keysignPayload, toAddressLabel }] = useCoreViewState<'keysign'>()

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
            renderPending={renderConnecting}
            render={() => (
              <KeysignActionProvider>
                <KeysignMessagePayloadProvider value={keysignPayload}>
                  <TransactionRecorderProvider>
                    <KeysignSigningStep
                      onBack={onBack}
                      toAddressLabel={toAddressLabel}
                    />
                  </TransactionRecorderProvider>
                </KeysignMessagePayloadProvider>
              </KeysignActionProvider>
            )}
          />
        </MpcPeersProvider>
      )}
    />
  )
}
