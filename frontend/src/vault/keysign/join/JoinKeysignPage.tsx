import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep';
import { CurrentSessionIdProvider } from '../../keygen/shared/state/currentSessionId';
import { CurrentLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId';
import { CurrentHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey';
import { useAssertCurrentVault } from '../../state/useCurrentVault';
import { KeysignSigningStep } from '../shared/KeysignSigningStep';
import { KeysignPayloadProvider } from '../shared/state/keysignPayload';
import { KeysignMsgsGuard } from './KeysignMsgsGuard';
import { KeysignServerUrlProvider } from './KeysignServerUrlProvider';
import { KeysignVaultGuard } from './KeysignVaultGuard';
import { useCurrentJoinKeysignMsg } from './state/currentJoinKeysignMsg';
import { JoinKeysignVerifyStep } from './verify/JoinKeysignVerifyStep';

const keysignSteps = ['verify', 'session', 'sign'] as const;

export const JoinKeysignPage = () => {
  const { step, setStep, toNextStep } = useStepNavigation(keysignSteps);

  const { keysignPayload, sessionId, encryptionKeyHex } =
    useCurrentJoinKeysignMsg();

  const { local_party_id } = useAssertCurrentVault();

  return (
    <KeysignVaultGuard>
      <KeysignPayloadProvider value={shouldBePresent(keysignPayload)}>
        <KeysignMsgsGuard>
          <KeysignServerUrlProvider>
            <CurrentSessionIdProvider value={sessionId}>
              <CurrentLocalPartyIdProvider value={local_party_id}>
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
                      <KeysignSigningStep onBack={() => setStep('verify')} />
                    )}
                  />
                </CurrentHexEncryptionKeyProvider>
              </CurrentLocalPartyIdProvider>
            </CurrentSessionIdProvider>
          </KeysignServerUrlProvider>
        </KeysignMsgsGuard>
      </KeysignPayloadProvider>
    </KeysignVaultGuard>
  );
};
