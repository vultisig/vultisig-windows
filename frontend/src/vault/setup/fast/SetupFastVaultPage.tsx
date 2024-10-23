import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import { getHexEncodedRandomBytes } from '../../../chain/utils/getHexEncodedRandomBytes';
import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { KeygenType } from '../../keygen/KeygenType';
import { KeygenStep } from '../../keygen/shared/KeygenStep';
import { CurrentServiceNameProvider } from '../../keygen/shared/state/currentServiceName';
import { CurrentSessionIdProvider } from '../../keygen/shared/state/currentSessionId';
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType';
import { CurrentLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../../keygen/state/currentServerType';
import { generateHexEncryptionKey } from '../../keygen/utils/generateHexEncryptionKey';
import { generateServiceName } from '../../keygen/utils/generateServiceName';
import { generateLocalPartyId } from '../../keygen/utils/localPartyId';
import { PeersSelectionRecordProvider } from '../../keysign/shared/state/selectedPeers';
import { SetupVaultNameStep } from '../SetupVaultNameStep';
import { VaultTypeProvider } from '../shared/state/vaultType';
import { StartKeygenVaultProvider } from '../StartKeygenVaultProvider';
import { CurrentHexChainCodeProvider } from '../state/currentHexChainCode';
import { CurrentHexEncryptionKeyProvider } from '../state/currentHexEncryptionKey';
import { ServerUrlDerivedFromServerTypeProvider } from '../state/serverUrlDerivedFromServerType';
import { SetupVaultNameProvider } from '../state/vaultName';
import { SetupVaultEmailStep } from './email/SetupVaultEmailStep';
import { EmailProvider } from './email/state/email';
import { SetupVaultPasswordStep } from './password/SetupVaultPasswordStep';
import { PasswordProvider } from './password/state/password';
import { SetupVaultServerStep } from './SetupVaultServerStep';

const steps = ['name', 'email', 'password', 'server', 'keygen'] as const;

export const SetupFastVaultPage = () => {
  const localPartyId = useMemo(generateLocalPartyId, []);

  const hexChainCode = useMemo(() => getHexEncodedRandomBytes(32), []);
  const hexEncryptionKey = useMemo(generateHexEncryptionKey, []);

  const serviceName = useMemo(generateServiceName, []);

  const sessionId = useMemo(uuidv4, []);

  const { step, setStep, toPreviousStep, toNextStep } =
    useStepNavigation(steps);

  const { t } = useTranslation();

  const vaultType = 'fast';

  return (
    <VaultTypeProvider value={vaultType}>
      <EmailProvider initialValue="">
        <PasswordProvider initialValue="">
          <CurrentServiceNameProvider value={serviceName}>
            <PeersSelectionRecordProvider initialValue={{}}>
              <CurrentSessionIdProvider value={sessionId}>
                <CurrentHexEncryptionKeyProvider value={hexEncryptionKey}>
                  <CurrentHexChainCodeProvider value={hexChainCode}>
                    <CurrentServerTypeProvider initialValue="relay">
                      <ServerUrlDerivedFromServerTypeProvider>
                        <CurrentLocalPartyIdProvider value={localPartyId}>
                          <SetupVaultNameProvider>
                            <StartKeygenVaultProvider>
                              <CurrentKeygenTypeProvider
                                value={KeygenType.Keygen}
                              >
                                <Match
                                  value={step}
                                  name={() => (
                                    <SetupVaultNameStep
                                      onForward={toNextStep}
                                    />
                                  )}
                                  email={() => (
                                    <SetupVaultEmailStep
                                      onBack={toPreviousStep}
                                      onForward={toNextStep}
                                    />
                                  )}
                                  password={() => (
                                    <SetupVaultPasswordStep
                                      onBack={toPreviousStep}
                                      onForward={toNextStep}
                                    />
                                  )}
                                  server={() => (
                                    <SetupVaultServerStep
                                      onBack={() => setStep('password')}
                                      onForward={toNextStep}
                                    />
                                  )}
                                  keygen={() => (
                                    <KeygenStep
                                      title={t('keygen_for_vault', {
                                        type: t(vaultType),
                                      })}
                                      onTryAgain={() => setStep(steps[0])}
                                      onBack={() => setStep('password')}
                                    />
                                  )}
                                />
                              </CurrentKeygenTypeProvider>
                            </StartKeygenVaultProvider>
                          </SetupVaultNameProvider>
                        </CurrentLocalPartyIdProvider>
                      </ServerUrlDerivedFromServerTypeProvider>
                    </CurrentServerTypeProvider>
                  </CurrentHexChainCodeProvider>
                </CurrentHexEncryptionKeyProvider>
              </CurrentSessionIdProvider>
            </PeersSelectionRecordProvider>
          </CurrentServiceNameProvider>
        </PasswordProvider>
      </EmailProvider>
    </VaultTypeProvider>
  );
};
