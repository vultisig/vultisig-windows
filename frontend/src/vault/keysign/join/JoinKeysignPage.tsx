import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { useAppPathState } from '../../../navigation/hooks/useAppPathState';
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep';
import { CurrentSessionIdProvider } from '../../keygen/shared/state/currentSessionId';
import { CurrentLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId';
import { CurrentHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey';
import { useCurrentVault } from '../../state/currentVault';
import { KeysignSigningStep } from '../shared/KeysignSigningStep';
import { KeysignPayloadProvider } from '../shared/state/keysignPayload';
import { KeysignMsgsGuard } from './KeysignMsgsGuard';
import { KeysignServerUrlProvider } from './KeysignServerUrlProvider';
import { KeysignVaultGuard } from './KeysignVaultGuard';
import { JoinKeysignVerifyStep } from './verify/JoinKeysignVerifyStep';

const keysignSteps = ['verify', 'session', 'sign'] as const;

export const JoinKeysignPage = () => {
  const { step, setStep, toNextStep } = useStepNavigation(keysignSteps);

  const {
    keysignMsg: { keysignPayload, sessionId, encryptionKeyHex },
  } = useAppPathState<'joinKeysign'>();

  const { local_party_id } = useCurrentVault();

  return (
    <CurrentLocalPartyIdProvider value={local_party_id}>
      <KeysignVaultGuard>
        <KeysignPayloadProvider value={shouldBePresent(keysignPayload)}>
          <KeysignMsgsGuard>
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
                      <KeysignSigningStep onBack={() => setStep('verify')} />
                    )}
                  />
                </CurrentHexEncryptionKeyProvider>
              </CurrentSessionIdProvider>
            </KeysignServerUrlProvider>
          </KeysignMsgsGuard>
        </KeysignPayloadProvider>
      </KeysignVaultGuard>
    </CurrentLocalPartyIdProvider>
  );
};
