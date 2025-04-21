import { StartMpcSessionStep } from '@core/ui/mpc/session/StartMpcSessionStep'
import { GeneratedHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { GeneratedMpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { GeneratedMpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { ServerUrlDerivedFromServerTypeProvider } from '@core/ui/mpc/state/serverUrlDerivedFromServerType'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { KeysignSigningStep } from '../shared/KeysignSigningStep'
import { KeysignMessagePayloadProvider } from '../shared/state/keysignMessagePayload'
import { KeysignPeerDiscoveryStep } from './peerDiscovery/KeysignPeerDiscoveryStep'

const keysignSteps = ['peers', 'session', 'sign'] as const

export const StartKeysignPage = () => {
  const { keysignPayload } = useAppPathState<'keysign'>()

  const { localPartyId } = useCurrentVault()

  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps: keysignSteps,
    onExit: useNavigateBack(),
  })

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
                      <Match
                        value={step}
                        peers={() => (
                          <KeysignPeerDiscoveryStep onFinish={toNextStep} />
                        )}
                        session={() => (
                          <StartMpcSessionStep
                            onFinish={toNextStep}
                            onBack={toPreviousStep}
                          />
                        )}
                        sign={() => (
                          <KeysignSigningStep
                            payload={keysignPayload}
                            onBack={() => setStep('peers')}
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
