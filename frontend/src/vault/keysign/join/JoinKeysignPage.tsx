import { useCallback, useState } from 'react';

import { Match } from '../../../lib/ui/base/Match';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { CurrentSessionIdProvider } from '../../keygen/shared/state/currentSessionId';
import { CurrentHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey';
import { KeysignSigningStep } from '../shared/KeysignSigningStep';
import { KeysignPayloadProvider } from '../shared/state/keysignPayload';
import { JoinKeysignSessionStep } from './JoinKeysignSessionStep';
import { KeysignMsgsGuard } from './KeysignMsgsGuard';
import { KeysignServerUrlProvider } from './KeysignServerUrlProvider';
import { KeysignVaultGuard } from './KeysignVaultGuard';
import { useCurrentJoinKeysignMsg } from './state/currentJoinKeysignMsg';
import { JoinKeysignVerifyStep } from './verify/JoinKeysignVerifyStep';

const keysignSteps = ['verify', 'session', 'sign'] as const;
type KeysignStep = (typeof keysignSteps)[number];

export const JoinKeysignPage = () => {
  const [step, setStep] = useState<KeysignStep>(keysignSteps[0]);

  const toNextStep = useCallback(() => {
    setStep(prev => keysignSteps[keysignSteps.indexOf(prev) + 1]);
  }, []);

  const { keysignPayload, sessionId, encryptionKeyHex } =
    useCurrentJoinKeysignMsg();

  return (
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
                    <JoinKeysignSessionStep
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
  );
};
