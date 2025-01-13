import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { useAppPathState } from '../../../navigation/hooks/useAppPathState';
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack';
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep';
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep';
import { MediatorManager } from '../../keygen/shared/peerDiscovery/MediatorManager';
import { GeneratedServiceNameProvider } from '../../keygen/shared/state/currentServiceName';
import { GeneratedSessionIdProvider } from '../../keygen/shared/state/currentSessionId';
import { CurrentLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../../keygen/state/currentServerType';
import { GeneratedHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey';
import { ServerUrlDerivedFromServerTypeProvider } from '../../setup/state/serverUrlDerivedFromServerType';
import { useCurrentVault } from '../../state/currentVault';
import { KeysignSigningStep } from '../shared/KeysignSigningStep';
import { KeysignPayloadProvider } from '../shared/state/keysignPayload';
import { PeersSelectionRecordProvider } from '../shared/state/selectedPeers';
import { KeysignPeerDiscoveryStep } from './peerDiscovery/KeysignPeerDiscoveryStep/KeysignPeerDiscoveryStep';

const keysignSteps = ['joinSession', 'peers', 'session', 'sign'] as const;

export const StartKeysignPage = () => {
  const { keysignPayload, keysignAction } = useAppPathState<'keysign'>();

  const { local_party_id } = useCurrentVault();

  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps: keysignSteps,
    onExit: useNavigateBack(),
  });

  return (
    <CurrentLocalPartyIdProvider value={local_party_id}>
      <KeysignPayloadProvider value={keysignPayload}>
        <GeneratedServiceNameProvider>
          <PeersSelectionRecordProvider initialValue={{}}>
            <GeneratedSessionIdProvider>
              <GeneratedHexEncryptionKeyProvider>
                <CurrentServerTypeProvider initialValue="relay">
                  <ServerUrlDerivedFromServerTypeProvider>
                    <MediatorManager />
                    <Match
                      value={step}
                      joinSession={() => (
                        <JoinKeygenSessionStep onForward={toNextStep} />
                      )}
                      peers={() => (
                        <KeysignPeerDiscoveryStep
                          actionType={keysignAction}
                          onForward={toNextStep}
                        />
                      )}
                      session={() => (
                        <KeygenStartSessionStep
                          onForward={toNextStep}
                          onBack={toPreviousStep}
                        />
                      )}
                      sign={() => (
                        <KeysignSigningStep
                          payload={{ keysign: keysignPayload }}
                          onBack={() => setStep('peers')}
                        />
                      )}
                    />
                  </ServerUrlDerivedFromServerTypeProvider>
                </CurrentServerTypeProvider>
              </GeneratedHexEncryptionKeyProvider>
            </GeneratedSessionIdProvider>
          </PeersSelectionRecordProvider>
        </GeneratedServiceNameProvider>
      </KeysignPayloadProvider>
    </CurrentLocalPartyIdProvider>
  );
};
