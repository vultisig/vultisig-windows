import { useMemo } from 'react';

import { KeysignPayload } from '../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Match } from '../../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../../lib/ui/hooks/useStepNavigation';
import { useAppPathParams } from '../../../../navigation/hooks/useAppPathParams';
import { JoinKeygenSessionStep } from '../../../keygen/shared/JoinKeygenSessionStep';
import { KeygenStartSessionStep } from '../../../keygen/shared/KeygenStartSessionStep';
import { MediatorManager } from '../../../keygen/shared/peerDiscovery/MediatorManager';
import { GeneratedServiceNameProvider } from '../../../keygen/shared/state/currentServiceName';
import { GeneratedSessionIdProvider } from '../../../keygen/shared/state/currentSessionId';
import { CurrentLocalPartyIdProvider } from '../../../keygen/state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../../../keygen/state/currentServerType';
import { PasswordProvider } from '../../../setup/fast/password/state/password';
import { GeneratedHexEncryptionKeyProvider } from '../../../setup/state/currentHexEncryptionKey';
import { ServerUrlDerivedFromServerTypeProvider } from '../../../setup/state/serverUrlDerivedFromServerType';
import { useAssertCurrentVault } from '../../../state/useCurrentVault';
import { KeysignMsgsGuard } from '../../join/KeysignMsgsGuard';
import { KeysignSigningStep } from '../../shared/KeysignSigningStep';
import { KeysignPayloadProvider } from '../../shared/state/keysignPayload';
import { PeersSelectionRecordProvider } from '../../shared/state/selectedPeers';
import { KeysignPeerDiscoveryStep } from '../peerDiscovery/KeysignPeerDiscoveryStep';
import { FastKeysignPasswordStep } from './FastKeysignPasswordStep';

const keysignSteps = [
  'password',
  'joinSession',
  'peers',
  'session',
  'sign',
] as const;

export const StartFastKeysignPage = () => {
  const [{ keysignPayload: rawPayload }] = useAppPathParams<'keysign'>();

  const payload = useMemo(() => {
    return KeysignPayload.fromJsonString(rawPayload);
  }, [rawPayload]);

  const { local_party_id } = useAssertCurrentVault();

  const { step, setStep, toPreviousStep, toNextStep } =
    useStepNavigation(keysignSteps);

  return (
    <PasswordProvider initialValue="">
      <KeysignPayloadProvider value={payload}>
        <KeysignMsgsGuard>
          <GeneratedServiceNameProvider>
            <PeersSelectionRecordProvider initialValue={{}}>
              <GeneratedSessionIdProvider>
                <GeneratedHexEncryptionKeyProvider>
                  <CurrentServerTypeProvider initialValue="relay">
                    <ServerUrlDerivedFromServerTypeProvider>
                      <CurrentLocalPartyIdProvider value={local_party_id}>
                        <MediatorManager />
                        <Match
                          value={step}
                          password={() => (
                            <FastKeysignPasswordStep onForward={toNextStep} />
                          )}
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
                              onBack={() => setStep('peers')}
                            />
                          )}
                        />
                      </CurrentLocalPartyIdProvider>
                    </ServerUrlDerivedFromServerTypeProvider>
                  </CurrentServerTypeProvider>
                </GeneratedHexEncryptionKeyProvider>
              </GeneratedSessionIdProvider>
            </PeersSelectionRecordProvider>
          </GeneratedServiceNameProvider>
        </KeysignMsgsGuard>
      </KeysignPayloadProvider>
    </PasswordProvider>
  );
};
