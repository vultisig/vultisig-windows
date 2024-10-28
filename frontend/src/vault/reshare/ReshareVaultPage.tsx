import { useTranslation } from 'react-i18next';

import { Match } from '../../lib/ui/base/Match';
import { useStepNavigation } from '../../lib/ui/hooks/useStepNavigation';
import { KeygenType } from '../keygen/KeygenType';
import { JoinKeygenSessionStep } from '../keygen/shared/JoinKeygenSessionStep';
import { KeygenStartSessionStep } from '../keygen/shared/KeygenStartSessionStep';
import { KeygenStep } from '../keygen/shared/KeygenStep';
import { MediatorManager } from '../keygen/shared/peerDiscovery/MediatorManager';
import { GeneratedServiceNameProvider } from '../keygen/shared/state/currentServiceName';
import { GeneratedSessionIdProvider } from '../keygen/shared/state/currentSessionId';
import { KeygenVerifyStep } from '../keygen/shared/verify/KeygenVerifyStep';
import { CurrentKeygenTypeProvider } from '../keygen/state/currentKeygenType';
import { CurrentKeygenVaultProvider } from '../keygen/state/currentKeygenVault';
import { CurrentLocalPartyIdProvider } from '../keygen/state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../keygen/state/currentServerType';
import { PeersSelectionRecordProvider } from '../keysign/shared/state/selectedPeers';
import { VaultTypeProvider } from '../setup/shared/state/vaultType';
import { CurrentHexChainCodeProvider } from '../setup/state/currentHexChainCode';
import { GeneratedHexEncryptionKeyProvider } from '../setup/state/currentHexEncryptionKey';
import { ServerUrlDerivedFromServerTypeProvider } from '../setup/state/serverUrlDerivedFromServerType';
import { useAssertCurrentVault } from '../state/useCurrentVault';
import { ReshareVaultPeerDiscoveryStep } from './ReshareVaultPeerDiscoveryStep';

const reshareVaultSteps = [
  'joinSession',
  'peers',
  'verify',
  'startSession',
  'keygen',
] as const;

export const ReshareVaultPage = () => {
  const vault = useAssertCurrentVault();
  const { local_party_id, hex_chain_code } = vault;

  const { step, setStep, toPreviousStep, toNextStep } =
    useStepNavigation(reshareVaultSteps);

  const { t } = useTranslation();

  return (
    <VaultTypeProvider value="secure">
      <GeneratedServiceNameProvider>
        <PeersSelectionRecordProvider initialValue={{}}>
          <GeneratedSessionIdProvider>
            <GeneratedHexEncryptionKeyProvider>
              <CurrentHexChainCodeProvider value={hex_chain_code}>
                <CurrentServerTypeProvider initialValue="relay">
                  <ServerUrlDerivedFromServerTypeProvider>
                    <CurrentLocalPartyIdProvider value={local_party_id}>
                      <CurrentKeygenTypeProvider value={KeygenType.Reshare}>
                        <CurrentKeygenVaultProvider value={vault}>
                          <MediatorManager />
                          <Match
                            value={step}
                            joinSession={() => (
                              <JoinKeygenSessionStep onForward={toNextStep} />
                            )}
                            peers={() => (
                              <ReshareVaultPeerDiscoveryStep
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
                                title={t('reshare')}
                                onTryAgain={() => setStep(reshareVaultSteps[0])}
                                onBack={() => setStep('verify')}
                              />
                            )}
                          />
                        </CurrentKeygenVaultProvider>
                      </CurrentKeygenTypeProvider>
                    </CurrentLocalPartyIdProvider>
                  </ServerUrlDerivedFromServerTypeProvider>
                </CurrentServerTypeProvider>
              </CurrentHexChainCodeProvider>
            </GeneratedHexEncryptionKeyProvider>
          </GeneratedSessionIdProvider>
        </PeersSelectionRecordProvider>
      </GeneratedServiceNameProvider>
    </VaultTypeProvider>
  );
};
