import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack';
import { KeygenType } from '../../keygen/KeygenType';
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
import { ServerPasswordHintStep } from '../../server/password-hint/ServerPasswordHintStep';
import { PasswordHintProvider } from '../../server/password-hint/state/password-hint';
import { SetupVaultNameStep } from '../SetupVaultNameStep';
import { VaultTypeProvider } from '../shared/state/vaultType';
import { StartKeygenVaultProvider } from '../StartKeygenVaultProvider';
import { GeneratedHexChainCodeProvider } from '../state/currentHexChainCode';
import { GeneratedHexEncryptionKeyProvider } from '../state/currentHexEncryptionKey';
import { ServerUrlDerivedFromServerTypeProvider } from '../state/serverUrlDerivedFromServerType';
import { SetupVaultNameProvider } from '../state/vaultName';
import { SetupFastVaultCreationStep } from './SetupFastVaultCreationStep';
import { SetupVaultServerStep } from './SetupVaultServerStep';

const steps = [
  'name',
  'email',
  'password',
  'hint',
  'setupForCreateVault',
  'createVault',
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
                                <PasswordHintProvider initialValue="">
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
                                    hint={() => (
                                      <ServerPasswordHintStep
                                        onBack={toPreviousStep}
                                        onForward={toNextStep}
                                      />
                                    )}
                                    setupForCreateVault={() => (
                                      <SetupVaultServerStep
                                        onBack={() => setStep(lastEditableStep)}
                                        onForward={toNextStep}
                                      />
                                    )}
                                    createVault={() => (
                                      <SetupFastVaultCreationStep
                                        onTryAgain={() => setStep(steps[0])}
                                        onBack={() => setStep(lastEditableStep)}
                                      />
                                    )}
                                  />
                                </PasswordHintProvider>
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
