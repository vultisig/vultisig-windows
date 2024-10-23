import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import { Match } from '../../lib/ui/base/Match';
import { useStepNavigation } from '../../lib/ui/hooks/useStepNavigation';
import { KeygenType } from '../keygen/KeygenType';
import { KeygenStartSessionStep } from '../keygen/shared/KeygenStartSessionStep';
import { KeygenStep } from '../keygen/shared/KeygenStep';
import { CurrentServiceNameProvider } from '../keygen/shared/state/currentServiceName';
import { CurrentSessionIdProvider } from '../keygen/shared/state/currentSessionId';
import { KeygenVerifyStep } from '../keygen/shared/verify/KeygenVerifyStep';
import { CurrentKeygenTypeProvider } from '../keygen/state/currentKeygenType';
import { CurrentKeygenVaultProvider } from '../keygen/state/currentKeygenVault';
import { CurrentLocalPartyIdProvider } from '../keygen/state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../keygen/state/currentServerType';
import { generateHexEncryptionKey } from '../keygen/utils/generateHexEncryptionKey';
import { generateServiceName } from '../keygen/utils/generateServiceName';
import { PeersSelectionRecordProvider } from '../keysign/shared/state/selectedPeers';
import { CurrentHexChainCodeProvider } from '../setup/state/currentHexChainCode';
import { CurrentHexEncryptionKeyProvider } from '../setup/state/currentHexEncryptionKey';
import { ServerUrlDerivedFromServerTypeProvider } from '../setup/state/serverUrlDerivedFromServerType';
import { useAssertCurrentVault } from '../state/useCurrentVault';
import { ReshareVaultPeerDiscoveryStep } from './ReshareVaultPeerDiscoveryStep';

const reshareVaultSteps = [
  'peers',
  'verify',
  'startSession',
  'keygen',
] as const;

export const ReshareVaultPage = () => {
  const vault = useAssertCurrentVault();
  const { local_party_id, hex_chain_code } = vault;

  const hexEncryptionKey = useMemo(generateHexEncryptionKey, []);

  const serviceName = useMemo(generateServiceName, []);

  const sessionId = useMemo(uuidv4, []);

  const { step, setStep, toPreviousStep, toNextStep } =
    useStepNavigation(reshareVaultSteps);

  const { t } = useTranslation();

  return (
    <CurrentServiceNameProvider value={serviceName}>
      <PeersSelectionRecordProvider initialValue={{}}>
        <CurrentSessionIdProvider value={sessionId}>
          <CurrentHexEncryptionKeyProvider value={hexEncryptionKey}>
            <CurrentHexChainCodeProvider value={hex_chain_code}>
              <CurrentServerTypeProvider initialValue="relay">
                <ServerUrlDerivedFromServerTypeProvider>
                  <CurrentLocalPartyIdProvider value={local_party_id}>
                    <CurrentKeygenTypeProvider value={KeygenType.Reshare}>
                      <CurrentKeygenVaultProvider value={vault}>
                        <Match
                          value={step}
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
          </CurrentHexEncryptionKeyProvider>
        </CurrentSessionIdProvider>
      </PeersSelectionRecordProvider>
    </CurrentServiceNameProvider>
  );
};
