import { useCallback, useState } from 'react';

import { Match } from '../../../lib/ui/base/Match';
import { JoinKeysignSessionStep } from './JoinKeysignSessionStep';
import { JoinKeysignSigningStep } from './JoinKeysignSigningStep';
import { KeysignMsgsGuard } from './KeysignMsgsGuard';
import { KeysignServerUrlProvider } from './KeysignServerUrlProvider';
import { KeysignVaultGuard } from './KeysignVaultGuard';
import { JoinKeysignVerifyStep } from './verify/JoinKeysignVerifyStep';

const keysignSteps = ['verify', 'session', 'sign'] as const;
type KeysignStep = (typeof keysignSteps)[number];

export const JoinKeysignPage = () => {
  const [step, setStep] = useState<KeysignStep>(keysignSteps[0]);

  const toNextStep = useCallback(() => {
    setStep(prev => keysignSteps[keysignSteps.indexOf(prev) + 1]);
  }, []);

  return (
    <KeysignVaultGuard>
      <KeysignMsgsGuard>
        <KeysignServerUrlProvider>
          <Match
            value={step}
            verify={() => <JoinKeysignVerifyStep onForward={toNextStep} />}
            session={() => (
              <JoinKeysignSessionStep
                onForward={toNextStep}
                onBack={() => setStep('verify')}
              />
            )}
            sign={() => (
              <JoinKeysignSigningStep onBack={() => setStep('verify')} />
            )}
          />
        </KeysignServerUrlProvider>
      </KeysignMsgsGuard>
    </KeysignVaultGuard>
  );
};
