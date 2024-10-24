import { useTranslation } from 'react-i18next';

import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { KeygenType } from '../../keygen/KeygenType';
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep';
import { KeygenStep } from '../../keygen/shared/KeygenStep';
import { GeneratedServiceNameProvider } from '../../keygen/shared/state/currentServiceName';
import { GeneratedSessionIdProvider } from '../../keygen/shared/state/currentSessionId';
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType';
import { GeneratedLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../../keygen/state/currentServerType';
import { PeersSelectionRecordProvider } from '../../keysign/shared/state/selectedPeers';
import { SetupVaultNameStep } from '../SetupVaultNameStep';
import { VaultTypeProvider } from '../shared/state/vaultType';
import { StartKeygenVaultProvider } from '../StartKeygenVaultProvider';
import { GeneratedHexChainCodeProvider } from '../state/currentHexChainCode';
import { GeneratedHexEncryptionKeyProvider } from '../state/currentHexEncryptionKey';
import { ServerUrlDerivedFromServerTypeProvider } from '../state/serverUrlDerivedFromServerType';
import { SetupVaultNameProvider } from '../state/vaultName';
import { SetupVaultEmailStep } from './email/SetupVaultEmailStep';
import { EmailProvider } from './email/state/email';
import { SetupVaultPasswordStep } from './password/SetupVaultPasswordStep';
import { PasswordProvider } from './password/state/password';
import { SetupVaultServerStep } from './SetupVaultServerStep';
import { SetupVaultWaitServerStep } from './SetupVaultWaitServerStep';

const steps = [
  'name',
  'email',
  'password',
  'server',
  'waitServer',
  'startSession',
  'keygen',
] as const;

const lastEditableStep = 'password';

export const SetupFastVaultPage = () => {
  const { step, setStep, toPreviousStep, toNextStep } =
    useStepNavigation(steps);

  const { t } = useTranslation();

  const vaultType = 'fast';

  return (
    <VaultTypeProvider value={vaultType}>
      <EmailProvider initialValue="">
        <PasswordProvider initialValue="">
          <GeneratedServiceNameProvider>
            <PeersSelectionRecordProvider initialValue={{}}>
              <GeneratedSessionIdProvider>
                <GeneratedHexEncryptionKeyProvider>
                  <GeneratedHexChainCodeProvider>
                    <CurrentServerTypeProvider initialValue="relay">
                      <ServerUrlDerivedFromServerTypeProvider>
                        <GeneratedLocalPartyIdProvider>
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
                                      onBack={() => setStep(lastEditableStep)}
                                      onForward={toNextStep}
                                    />
                                  )}
                                  waitServer={() => (
                                    <SetupVaultWaitServerStep
                                      onBack={() => setStep(lastEditableStep)}
                                      onForward={toNextStep}
                                    />
                                  )}
                                  startSession={() => (
                                    <KeygenStartSessionStep
                                      onBack={() => setStep(lastEditableStep)}
                                      onForward={toNextStep}
                                    />
                                  )}
                                  keygen={() => (
                                    <KeygenStep
                                      title={t('keygen_for_vault', {
                                        type: t(vaultType),
                                      })}
                                      onTryAgain={() => setStep(steps[0])}
                                      onBack={() => setStep(lastEditableStep)}
                                    />
                                  )}
                                />
                              </CurrentKeygenTypeProvider>
                            </StartKeygenVaultProvider>
                          </SetupVaultNameProvider>
                        </GeneratedLocalPartyIdProvider>
                      </ServerUrlDerivedFromServerTypeProvider>
                    </CurrentServerTypeProvider>
                  </GeneratedHexChainCodeProvider>
                </GeneratedHexEncryptionKeyProvider>
              </GeneratedSessionIdProvider>
            </PeersSelectionRecordProvider>
          </GeneratedServiceNameProvider>
        </PasswordProvider>
      </EmailProvider>
    </VaultTypeProvider>
  );
};
