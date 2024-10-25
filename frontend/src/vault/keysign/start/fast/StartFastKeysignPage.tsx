import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { KeysignPayload } from '../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Match } from '../../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../../lib/ui/hooks/useStepNavigation';
import { useAppPathParams } from '../../../../navigation/hooks/useAppPathParams';
import { KeygenStartSessionStep } from '../../../keygen/shared/KeygenStartSessionStep';
import { MediatorManager } from '../../../keygen/shared/peerDiscovery/MediatorManager';
import { GeneratedServiceNameProvider } from '../../../keygen/shared/state/currentServiceName';
import { GeneratedSessionIdProvider } from '../../../keygen/shared/state/currentSessionId';
import { CurrentLocalPartyIdProvider } from '../../../keygen/state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../../../keygen/state/currentServerType';
import { WaitForServerToJoinStep } from '../../../server/components/WaitForServerToJoinStep';
import { ServerPasswordStep } from '../../../server/password/ServerPasswordStep';
import { PasswordProvider } from '../../../server/password/state/password';
import { GeneratedHexEncryptionKeyProvider } from '../../../setup/state/currentHexEncryptionKey';
import { ServerUrlDerivedFromServerTypeProvider } from '../../../setup/state/serverUrlDerivedFromServerType';
import { useAssertCurrentVault } from '../../../state/useCurrentVault';
import { KeysignMsgsGuard } from '../../join/KeysignMsgsGuard';
import { KeysignSigningStep } from '../../shared/KeysignSigningStep';
import { KeysignPayloadProvider } from '../../shared/state/keysignPayload';
import { PeersSelectionRecordProvider } from '../../shared/state/selectedPeers';
import { FastKeysignServerStep } from './FastKeysignServerStep';

const keysignSteps = [
  'password',
  'server',
  'waitServer',
  'startSession',
  'sign',
] as const;

export const StartFastKeysignPage = () => {
  const [{ keysignPayload: rawPayload }] = useAppPathParams<'keysign'>();

  const payload = useMemo(() => {
    return KeysignPayload.fromJsonString(rawPayload);
  }, [rawPayload]);

  const { local_party_id } = useAssertCurrentVault();

  const { step, toNextStep } = useStepNavigation(keysignSteps);

  const { t } = useTranslation();

  return (
    <PasswordProvider initialValue="">
      <CurrentLocalPartyIdProvider value={local_party_id}>
        <KeysignPayloadProvider value={payload}>
          <KeysignMsgsGuard>
            <GeneratedServiceNameProvider>
              <PeersSelectionRecordProvider initialValue={{}}>
                <GeneratedSessionIdProvider>
                  <GeneratedHexEncryptionKeyProvider>
                    <CurrentServerTypeProvider initialValue="relay">
                      <ServerUrlDerivedFromServerTypeProvider>
                        <MediatorManager />
                        <Match
                          value={step}
                          password={() => (
                            <ServerPasswordStep onForward={toNextStep} />
                          )}
                          startSession={() => (
                            <KeygenStartSessionStep onForward={toNextStep} />
                          )}
                          waitServer={() => (
                            <WaitForServerToJoinStep
                              title={t('fast_sign')}
                              onForward={toNextStep}
                            />
                          )}
                          server={() => (
                            <FastKeysignServerStep onForward={toNextStep} />
                          )}
                          sign={() => <KeysignSigningStep />}
                        />
                      </ServerUrlDerivedFromServerTypeProvider>
                    </CurrentServerTypeProvider>
                  </GeneratedHexEncryptionKeyProvider>
                </GeneratedSessionIdProvider>
              </PeersSelectionRecordProvider>
            </GeneratedServiceNameProvider>
          </KeysignMsgsGuard>
        </KeysignPayloadProvider>
      </CurrentLocalPartyIdProvider>
    </PasswordProvider>
  );
};
