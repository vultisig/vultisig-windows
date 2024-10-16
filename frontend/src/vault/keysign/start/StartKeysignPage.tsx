import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams';
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep';
import { CurrentServiceNameProvider } from '../../keygen/shared/state/currentServiceName';
import { CurrentSessionIdProvider } from '../../keygen/shared/state/currentSessionId';
import { CurrentLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../../keygen/state/currentServerType';
import { generateHexEncryptionKey } from '../../keygen/utils/generateHexEncryptionKey';
import { generateServiceName } from '../../keygen/utils/generateServiceName';
import { CurrentHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey';
import { ServerUrlDerivedFromServerTypeProvider } from '../../setup/state/serverUrlDerivedFromServerType';
import { useAssertCurrentVault } from '../../state/useCurrentVault';
import { KeysignMsgsGuard } from '../join/KeysignMsgsGuard';
import { KeysignSigningStep } from '../shared/KeysignSigningStep';
import { KeysignPayloadProvider } from '../shared/state/keysignPayload';
import { PeersSelectionRecordProvider } from '../shared/state/selectedPeers';
import { KeysignPeerDiscoveryStep } from './peerDiscovery/KeysignPeerDiscoveryStep';

const keysignSteps = ['peers', 'session', 'sign'] as const;

export const StartKeysignPage = () => {
  const [{ keysignPayload: rawPayload }] = useAppPathParams<'keysign'>();

  const sessionId = useMemo(uuidv4, []);

  const payload = useMemo(() => {
    return KeysignPayload.fromJsonString(rawPayload);
  }, [rawPayload]);

  const serviceName = useMemo(generateServiceName, []);

  const hexEncryptionKey = useMemo(generateHexEncryptionKey, []);

  const { local_party_id } = useAssertCurrentVault();

  const { step, setStep, toPreviousStep, toNextStep } =
    useStepNavigation(keysignSteps);

  return (
    <KeysignPayloadProvider value={payload}>
      <KeysignMsgsGuard>
        <CurrentServiceNameProvider value={serviceName}>
          <PeersSelectionRecordProvider initialValue={{}}>
            <CurrentSessionIdProvider value={sessionId}>
              <CurrentHexEncryptionKeyProvider value={hexEncryptionKey}>
                <CurrentServerTypeProvider initialValue="relay">
                  <ServerUrlDerivedFromServerTypeProvider>
                    <CurrentLocalPartyIdProvider value={local_party_id}>
                      <Match
                        value={step}
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
                          <KeysignSigningStep onBack={() => setStep('peers')} />
                        )}
                      />
                    </CurrentLocalPartyIdProvider>
                  </ServerUrlDerivedFromServerTypeProvider>
                </CurrentServerTypeProvider>
              </CurrentHexEncryptionKeyProvider>
            </CurrentSessionIdProvider>
          </PeersSelectionRecordProvider>
        </CurrentServiceNameProvider>
      </KeysignMsgsGuard>
    </KeysignPayloadProvider>
  );
};
