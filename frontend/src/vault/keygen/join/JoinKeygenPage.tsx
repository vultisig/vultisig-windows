import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { CurrentServiceNameProvider } from '../../setup/state/currentServiceName';
import { JoinKeygenSessionStep } from '../shared/JoinKeygenSessionStep';
import { CurrentSessionIdProvider } from '../shared/state/currentSessionId';
import { useCurrentJoinKeygenMsg } from '../state/currentJoinKeygenMsg';
import { CurrentLocalPartyIdProvider } from '../state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../state/currentServerType';
import { generateLocalPartyId } from '../utils/localPartyId';
import { JoinKeygenProcess } from './JoinKeygenProcess';
import { KeygenServerUrlProvider } from './KeygenServerUrlProvider';

const keygenSteps = ['session', 'keygen'] as const;

export const JoinKeygenPage = () => {
  const localPartyId = useMemo(generateLocalPartyId, []);

  const keygenMsg = useCurrentJoinKeygenMsg();

  const { sessionId, useVultisigRelay, serviceName } = keygenMsg;

  const serverType = useVultisigRelay ? 'relay' : 'local';

  const { step, toNextStep } = useStepNavigation(keygenSteps);

  const { t } = useTranslation();

  return (
    <CurrentLocalPartyIdProvider value={localPartyId}>
      <CurrentServiceNameProvider value={serviceName}>
        <CurrentServerTypeProvider initialValue={serverType}>
          <CurrentSessionIdProvider value={sessionId}>
            <KeygenServerUrlProvider>
              <Match
                value={step}
                session={() => (
                  <JoinKeygenSessionStep
                    title={t('join_keygen')}
                    onForward={toNextStep}
                  />
                )}
                keygen={() => <JoinKeygenProcess />}
              />
            </KeygenServerUrlProvider>
          </CurrentSessionIdProvider>
        </CurrentServerTypeProvider>
      </CurrentServiceNameProvider>
    </CurrentLocalPartyIdProvider>
  );
};
