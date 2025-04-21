import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { GeneratedHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { GeneratedMpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { GeneratedMpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { ServerUrlDerivedFromServerTypeProvider } from '@core/ui/mpc/state/serverUrlDerivedFromServerType'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { StepTransition } from '@lib/ui/base/StepTransition'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { KeysignSigningStep } from '../shared/KeysignSigningStep'
import { KeysignMessagePayloadProvider } from '../shared/state/keysignMessagePayload'
import { KeysignPeerDiscoveryStep } from './peerDiscovery/KeysignPeerDiscoveryStep'

export const StartKeysignPage = () => {
  const { keysignPayload } = useAppPathState<'keysign'>()

  const { localPartyId } = useCurrentVault()

  return (
    <IsInitiatingDeviceProvider value={true}>
      <KeysignMessagePayloadProvider value={keysignPayload}>
        <MpcLocalPartyIdProvider value={localPartyId}>
          <GeneratedMpcServiceNameProvider>
            <MpcPeersSelectionProvider>
              <GeneratedMpcSessionIdProvider>
                <GeneratedHexEncryptionKeyProvider>
                  <MpcServerTypeProvider initialValue="relay">
                    <ServerUrlDerivedFromServerTypeProvider>
                      <MpcMediatorManager />
                      <StepTransition
                        from={({ onFinish }) => (
                          <KeysignPeerDiscoveryStep onFinish={onFinish} />
                        )}
                        to={({ onBack }) => (
                          <StartMpcSessionFlow
                            render={() => (
                              <KeysignSigningStep
                                payload={keysignPayload}
                                onBack={onBack}
                              />
                            )}
                          />
                        )}
                      />
                    </ServerUrlDerivedFromServerTypeProvider>
                  </MpcServerTypeProvider>
                </GeneratedHexEncryptionKeyProvider>
              </GeneratedMpcSessionIdProvider>
            </MpcPeersSelectionProvider>
          </GeneratedMpcServiceNameProvider>
        </MpcLocalPartyIdProvider>
      </KeysignMessagePayloadProvider>
    </IsInitiatingDeviceProvider>
  )
}
