import { Match } from '../../../lib/ui/base/Match'
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation'
import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { MpcServerTypeProvider } from '../../../mpc/serverType/state/mpcServerType'
import { IsInitiatingDeviceProvider } from '../../../mpc/state/isInitiatingDevice'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep'
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep'
import { GeneratedServiceNameProvider } from '../../keygen/shared/state/currentServiceName'
import { GeneratedSessionIdProvider } from '../../keygen/shared/state/currentSessionId'
import { CurrentLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId'
import { GeneratedHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey'
import { ServerUrlDerivedFromServerTypeProvider } from '../../setup/state/serverUrlDerivedFromServerType'
import { useCurrentVault } from '../../state/currentVault'
import { KeysignSigningStep } from '../shared/KeysignSigningStep'
import { KeysignMessagePayloadProvider } from '../shared/state/keysignMessagePayload'
import { PeersSelectionRecordProvider } from '../shared/state/selectedPeers'
import { KeysignPeerDiscoveryStep } from './peerDiscovery/KeysignPeerDiscoveryStep'

const keysignSteps = ['joinSession', 'peers', 'session', 'sign'] as const

export const StartKeysignPage = () => {
  const { keysignPayload } = useAppPathState<'keysign'>()

  const { local_party_id } = useCurrentVault()

  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps: keysignSteps,
    onExit: useNavigateBack(),
  })

  return (
    <IsInitiatingDeviceProvider value={true}>
      <KeysignMessagePayloadProvider value={keysignPayload}>
        <CurrentLocalPartyIdProvider value={local_party_id}>
          <GeneratedServiceNameProvider>
            <PeersSelectionRecordProvider initialValue={{}}>
              <GeneratedSessionIdProvider>
                <GeneratedHexEncryptionKeyProvider>
                  <MpcServerTypeProvider initialValue="relay">
                    <ServerUrlDerivedFromServerTypeProvider>
                      <MpcMediatorManager />
                      <Match
                        value={step}
                        joinSession={() => (
                          <JoinKeygenSessionStep onForward={toNextStep} />
                        )}
                        peers={() => (
                          <KeysignPeerDiscoveryStep onForward={toNextStep} />
                        )}
                        session={() => (
                          <KeygenStartSessionStep
                            onForward={toNextStep}
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
              </GeneratedSessionIdProvider>
            </PeersSelectionRecordProvider>
          </GeneratedServiceNameProvider>
        </CurrentLocalPartyIdProvider>
      </KeysignMessagePayloadProvider>
    </IsInitiatingDeviceProvider>
  )
}
