import { TxResult } from '@core/chain/tx/execute/ExecuteTxResolver'
import { KeysignSigningStep } from '@core/ui/mpc/keysign/KeysignSigningStep'
import { KeysignPeerDiscoveryStep } from '@core/ui/mpc/keysign/peers/KeysignPeerDiscoveryStep'
import { KeysignActionProviderProp } from '@core/ui/mpc/keysign/start/KeysignActionProviderProp'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { OnFinishProp } from '@lib/ui/props'

import { useRefreshedKeysignPayload } from '../hooks/useRefreshedKeysignPayload'

export const StartSecureKeysignFlow = ({
  keysignActionProvider: KeysignActionProvider,
  onFinish,
}: KeysignActionProviderProp &
  Partial<OnFinishProp<TxResult & { shouldClose: boolean }>>) => {
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
            value="keysign"
            render={() => (
              <KeysignActionProvider>
                <KeysignSigningStep
                  payload={keysignPayload}
                  onBack={onBack}
                  onFinish={onFinish}
                />
              </KeysignActionProvider>
            )}
          />
        </MpcPeersProvider>
      )}
    />
  )
}
