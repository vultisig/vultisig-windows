import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack';
import { KeygenType } from '../../keygen/KeygenType';
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep';
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep';
import { GeneratedServiceNameProvider } from '../../keygen/shared/state/currentServiceName';
import { GeneratedSessionIdProvider } from '../../keygen/shared/state/currentSessionId';
import { KeygenVerifyStep } from '../../keygen/shared/verify/KeygenVerifyStep';
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType';
import { GeneratedLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../../keygen/state/currentServerType';
import { PeersSelectionRecordProvider } from '../../keysign/shared/state/selectedPeers';
import { ServerEmailStep } from '../../server/email/ServerEmailStep';
import { EmailProvider } from '../../server/email/state/email';
import { SetServerPasswordStep } from '../../server/password/SetServerPasswordStep';
import { PasswordProvider } from '../../server/password/state/password';
import { SetupVaultServerStep } from '../fast/SetupVaultServerStep';
import { SetupVaultPeerDiscoveryStep } from '../peers/SetupVaultPeerDiscoveryStep';
import { SetupVaultNameStep } from '../SetupVaultNameStep';
import { SetupVaultKeygenStep } from '../shared/SetupVaultKeygenStep';
import { VaultTypeProvider } from '../shared/state/vaultType';
import { StartKeygenVaultProvider } from '../StartKeygenVaultProvider';
import { GeneratedHexChainCodeProvider } from '../state/currentHexChainCode';
import { GeneratedHexEncryptionKeyProvider } from '../state/currentHexEncryptionKey';
import { ServerUrlDerivedFromServerTypeProvider } from '../state/serverUrlDerivedFromServerType';
import { SetupVaultNameProvider } from '../state/vaultName';

const steps = [
  'name',
  'email',
  'password',
  'server',
  'joinSession',
  'peers',
  'verify',
  'startSession',
  'keygen',
] as const;

const lastEditableStep = 'password';

export const SetupActiveVaultPage = () => {
  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps,
    onExit: useNavigateBack(),
  });

  return (
    <VaultTypeProvider value="active">
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
                                  verify={() => (
                                    <KeygenVerifyStep
                                      onBack={toPreviousStep}
                                      onForward={toNextStep}
                                    />
                                  )}
                                  joinSession={() => (
                                    <JoinKeygenSessionStep
                                      onBack={() => setStep(lastEditableStep)}
                                      onForward={toNextStep}
                                    />
                                  )}
                                  peers={() => (
                                    <SetupVaultPeerDiscoveryStep
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
