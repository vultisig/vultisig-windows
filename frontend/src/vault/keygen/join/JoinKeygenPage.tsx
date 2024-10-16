import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams';
import { CurrentHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey';
import { JoinKeygenSessionStep } from '../shared/JoinKeygenSessionStep';
import { CurrentServiceNameProvider } from '../shared/state/currentServiceName';
import { CurrentSessionIdProvider } from '../shared/state/currentSessionId';
import { useCurrentJoinKeygenMsg } from '../state/currentJoinKeygenMsg';
import { CurrentKeygenTypeProvider } from '../state/currentKeygenType';
import { CurrentLocalPartyIdProvider } from '../state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../state/currentServerType';
import { generateLocalPartyId } from '../utils/localPartyId';
import { JoinKeygenProcess } from './JoinKeygenProcess';
import { JoinKeygenVaultProvider } from './JoinKeygenVaultProvider';
import { KeygenServerUrlProvider } from './KeygenServerUrlProvider';

const keygenSteps = ['session', 'keygen'] as const;

export const JoinKeygenPage = () => {
  const localPartyId = useMemo(generateLocalPartyId, []);

  const [{ keygenType }] = useAppPathParams<'joinKeygen'>();

  const keygenMsg = useCurrentJoinKeygenMsg();

  const { sessionId, useVultisigRelay, serviceName, encryptionKeyHex } =
    keygenMsg;

  const serverType = useVultisigRelay ? 'relay' : 'local';

  const { step, toNextStep } = useStepNavigation(keygenSteps);

  const { t } = useTranslation();

  return (
    <CurrentLocalPartyIdProvider value={localPartyId}>
      <CurrentServiceNameProvider value={serviceName}>
        <CurrentServerTypeProvider initialValue={serverType}>
          <CurrentSessionIdProvider value={sessionId}>
            <CurrentKeygenTypeProvider value={keygenType}>
              <CurrentHexEncryptionKeyProvider value={encryptionKeyHex}>
                <KeygenServerUrlProvider>
                  <JoinKeygenVaultProvider>
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
                  </JoinKeygenVaultProvider>
                </KeygenServerUrlProvider>
              </CurrentHexEncryptionKeyProvider>
            </CurrentKeygenTypeProvider>
          </CurrentSessionIdProvider>
        </CurrentServerTypeProvider>
      </CurrentServiceNameProvider>
    </CurrentLocalPartyIdProvider>
  );
};
