import { useMemo } from 'react';

import { getKeysignMessagePayload } from '../../../chain/keysign/KeysignMessagePayload';
import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { useAppPathState } from '../../../navigation/hooks/useAppPathState';
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack';
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep';
import { CurrentSessionIdProvider } from '../../keygen/shared/state/currentSessionId';
import { CurrentLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId';
import { CurrentHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey';
import { useCurrentVault } from '../../state/currentVault';
import { KeysignSigningStep } from '../shared/KeysignSigningStep';
import { KeysignMessagePayloadProvider } from '../shared/state/keysignMessagePayload';
import { KeysignServerUrlProvider } from './KeysignServerUrlProvider';
import { KeysignVaultGuard } from './KeysignVaultGuard';
import { JoinKeysignVerifyStep } from './verify/JoinKeysignVerifyStep';

const keysignSteps = ['verify', 'session', 'sign'] as const;

export const JoinKeysignPage = () => {
  const { step, setStep, toNextStep } = useStepNavigation({
    steps: keysignSteps,
    onExit: useNavigateBack(),
  });

  const { keysignMsg } = useAppPathState<'joinKeysign'>();

  const { sessionId, encryptionKeyHex } = keysignMsg;

  const { local_party_id } = useCurrentVault();

  const keysignMessagePayload = useMemo(
    () => getKeysignMessagePayload(keysignMsg),
    [keysignMsg]
  );

  return (
    <KeysignMessagePayloadProvider value={keysignMessagePayload}>
      <CurrentLocalPartyIdProvider value={local_party_id}>
        <KeysignVaultGuard>
          <KeysignServerUrlProvider>
            <CurrentSessionIdProvider value={sessionId}>
              <CurrentHexEncryptionKeyProvider value={encryptionKeyHex}>
                <Match
                  value={step}
                  verify={() => (
                    <JoinKeysignVerifyStep onForward={toNextStep} />
                  )}
                  session={() => (
                    <JoinKeygenSessionStep
                      onForward={toNextStep}
                      onBack={() => setStep('verify')}
                    />
                  )}
                  sign={() => (
                    <KeysignSigningStep
                      payload={getKeysignMessagePayload(keysignMsg)}
                      onBack={() => setStep('verify')}
                    />
                  )}
                />
              </CurrentHexEncryptionKeyProvider>
            </CurrentSessionIdProvider>
          </KeysignServerUrlProvider>
        </KeysignVaultGuard>
      </CurrentLocalPartyIdProvider>
    </KeysignMessagePayloadProvider>
  );
};
