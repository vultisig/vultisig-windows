import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack';
import { KeygenType } from '../../keygen/KeygenType';
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep';
import { GeneratedServiceNameProvider } from '../../keygen/shared/state/currentServiceName';
import { GeneratedSessionIdProvider } from '../../keygen/shared/state/currentSessionId';
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType';
import { GeneratedLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../../keygen/state/currentServerType';
import { PeersSelectionRecordProvider } from '../../keysign/shared/state/selectedPeers';
import { ServerEmailStep } from '../../server/email/ServerEmailStep';
import { EmailProvider } from '../../server/email/state/email';
import { SetServerPasswordStep } from '../../server/password/SetServerPasswordStep';
import { PasswordProvider } from '../../server/password/state/password';
import { SetupVaultNameStep } from '../SetupVaultNameStep';
import { SetupVaultKeygenStep } from '../shared/SetupVaultKeygenStep';
import { VaultTypeProvider } from '../shared/state/vaultType';
import { StartKeygenVaultProvider } from '../StartKeygenVaultProvider';
import { GeneratedHexChainCodeProvider } from '../state/currentHexChainCode';
import { GeneratedHexEncryptionKeyProvider } from '../state/currentHexEncryptionKey';
import { ServerUrlDerivedFromServerTypeProvider } from '../state/serverUrlDerivedFromServerType';
import { SetupVaultNameProvider } from '../state/vaultName';
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
  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps,
    onExit: useNavigateBack(),
  });

  return (
    <VaultTypeProvider value="fast">
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
                                    <ServerEmailStep
                                      onBack={toPreviousStep}
                                      onForward={toNextStep}
                                    />
                                  )}
                                  password={() => (
                                    <SetServerPasswordStep
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
                                    <SetupVaultKeygenStep
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
