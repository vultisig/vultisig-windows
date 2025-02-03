import { useTranslation } from 'react-i18next';

import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { match } from '@lib/utils/match';
import { useAppPathState } from '../../../navigation/hooks/useAppPathState';
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack';
import { CurrentHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey';
import { KeygenType } from '../KeygenType';
import { JoinKeygenSessionStep } from '../shared/JoinKeygenSessionStep';
import { CurrentServiceNameProvider } from '../shared/state/currentServiceName';
import { CurrentSessionIdProvider } from '../shared/state/currentSessionId';
import { CurrentKeygenTypeProvider } from '../state/currentKeygenType';
import { CurrentServerTypeProvider } from '../state/currentServerType';
import { JoinKeygenProcess } from './JoinKeygenProcess';
import { JoinKeygenVaultProvider } from './JoinKeygenVaultProvider';
import { KeygenServerUrlProvider } from './KeygenServerUrlProvider';

const keygenSteps = ['session', 'keygen'] as const;

export const JoinKeygenPage = () => {
  const { keygenType, keygenMsg } = useAppPathState<'joinKeygen'>();

  const { sessionId, useVultisigRelay, serviceName, encryptionKeyHex } =
    keygenMsg;

  const serverType = useVultisigRelay ? 'relay' : 'local';

  const { step, toNextStep } = useStepNavigation({
    steps: keygenSteps,
    onExit: useNavigateBack(),
  });

  const { t } = useTranslation();

  const title = match(keygenType, {
    [KeygenType.Keygen]: () => t('join_keygen'),
    [KeygenType.Reshare]: () => t('join_reshare'),
  });

  return (
    <CurrentServiceNameProvider value={serviceName}>
      <CurrentServerTypeProvider initialValue={serverType}>
        <CurrentSessionIdProvider value={sessionId}>
          <CurrentKeygenTypeProvider value={keygenType}>
            <CurrentHexEncryptionKeyProvider value={encryptionKeyHex}>
              <JoinKeygenVaultProvider>
                <KeygenServerUrlProvider>
                  <Match
                    value={step}
                    session={() => (
                      <JoinKeygenSessionStep onForward={toNextStep} />
                    )}
                    keygen={() => <JoinKeygenProcess title={title} />}
                  />
                </KeygenServerUrlProvider>
              </JoinKeygenVaultProvider>
            </CurrentHexEncryptionKeyProvider>
          </CurrentKeygenTypeProvider>
        </CurrentSessionIdProvider>
      </CurrentServerTypeProvider>
    </CurrentServiceNameProvider>
  );
};
