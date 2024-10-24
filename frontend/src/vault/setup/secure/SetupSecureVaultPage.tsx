import { useTranslation } from 'react-i18next';

import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { KeygenType } from '../../keygen/KeygenType';
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep';
import { KeygenStep } from '../../keygen/shared/KeygenStep';
import { GeneratedServiceNameProvider } from '../../keygen/shared/state/currentServiceName';
import { GeneratedSessionIdProvider } from '../../keygen/shared/state/currentSessionId';
import { KeygenVerifyStep } from '../../keygen/shared/verify/KeygenVerifyStep';
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType';
import { GeneratedLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../../keygen/state/currentServerType';
import { PeersSelectionRecordProvider } from '../../keysign/shared/state/selectedPeers';
import { SetupVaultPeerDiscoveryStep } from '../peers/SetupVaultPeerDiscoveryStep';
import { SetupVaultNameStep } from '../SetupVaultNameStep';
import { VaultTypeProvider } from '../shared/state/vaultType';
import { StartKeygenVaultProvider } from '../StartKeygenVaultProvider';
import { GeneratedHexChainCodeProvider } from '../state/currentHexChainCode';
import { GeneratedHexEncryptionKeyProvider } from '../state/currentHexEncryptionKey';
import { ServerUrlDerivedFromServerTypeProvider } from '../state/serverUrlDerivedFromServerType';
import { SetupVaultNameProvider } from '../state/vaultName';

const steps = ['name', 'peers', 'verify', 'startSession', 'keygen'] as const;

export const SetupSecureVaultPage = () => {
  const { step, setStep, toPreviousStep, toNextStep } =
    useStepNavigation(steps);

  const { t } = useTranslation();

  const vaultType = 'secure';

  return (
    <VaultTypeProvider value={vaultType}>
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
                          <CurrentKeygenTypeProvider value={KeygenType.Keygen}>
                            <Match
                              value={step}
                              name={() => (
                                <SetupVaultNameStep
                                  onBack={toPreviousStep}
                                  onForward={toNextStep}
                                />
                              )}
                              peers={() => (
                                <SetupVaultPeerDiscoveryStep
                                  onBack={toPreviousStep}
                                  onForward={toNextStep}
                                />
                              )}
                              verify={() => (
                                <KeygenVerifyStep
                                  onBack={toPreviousStep}
                                  onForward={toNextStep}
                                />
                              )}
                              startSession={() => (
                                <KeygenStartSessionStep
                                  onBack={toPreviousStep}
                                  onForward={toNextStep}
                                />
                              )}
                              keygen={() => (
                                <KeygenStep
                                  title={t('keygen_for_vault', {
                                    type: t(vaultType),
                                  })}
                                  onTryAgain={() => setStep(steps[0])}
                                  onBack={() => setStep('verify')}
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
    </VaultTypeProvider>
  );
};
