import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Match } from '../../lib/ui/base/Match';
import { useStepNavigation } from '../../lib/ui/hooks/useStepNavigation';
import { KeygenStartSessionStep } from '../keygen/shared/KeygenStartSessionStep';
import { CurrentServiceNameProvider } from '../keygen/shared/state/currentServiceName';
import { CurrentSessionIdProvider } from '../keygen/shared/state/currentSessionId';
import { CurrentLocalPartyIdProvider } from '../keygen/state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../keygen/state/currentServerType';
import { generateHexEncryptionKey } from '../keygen/utils/generateHexEncryptionKey';
import { generateServiceName } from '../keygen/utils/generateServiceName';
import { PeersSelectionRecordProvider } from '../keysign/shared/state/selectedPeers';
import { SetupVaultKeygenStep } from '../setup/SetupVaultKeygenStep';
import { CurrentHexChainCodeProvider } from '../setup/state/currentHexChainCode';
import { CurrentHexEncryptionKeyProvider } from '../setup/state/currentHexEncryptionKey';
import { ServerUrlDerivedFromServerTypeProvider } from '../setup/state/serverUrlDerivedFromServerType';
import { SetupVaultVerifyStep } from '../setup/verify/SetupVaultVerifyStep';
import { useAssertCurrentVault } from '../state/useCurrentVault';
import { ReshareVaultPeerDiscoveryStep } from './ReshareVaultPeerDiscoveryStep';

const reshareVaultSteps = [
  'peers',
  'verify',
  'startSession',
  'keygen',
] as const;

export const ReshareVaultPage = () => {
  const { local_party_id, hex_chain_code } = useAssertCurrentVault();

  const hexEncryptionKey = useMemo(generateHexEncryptionKey, []);

  const serviceName = useMemo(generateServiceName, []);

  const sessionId = useMemo(uuidv4, []);

  const { step, setStep, toPreviousStep, toNextStep } =
    useStepNavigation(reshareVaultSteps);

  return (
    <CurrentServiceNameProvider value={serviceName}>
      <PeersSelectionRecordProvider initialValue={{}}>
        <CurrentSessionIdProvider value={sessionId}>
          <CurrentHexEncryptionKeyProvider value={hexEncryptionKey}>
            <CurrentHexChainCodeProvider value={hex_chain_code}>
              <CurrentServerTypeProvider initialValue="relay">
                <ServerUrlDerivedFromServerTypeProvider>
                  <CurrentLocalPartyIdProvider value={local_party_id}>
                    <Match
                      value={step}
                      peers={() => (
                        <ReshareVaultPeerDiscoveryStep onForward={toNextStep} />
                      )}
                      verify={() => (
                        <SetupVaultVerifyStep
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
                        <SetupVaultKeygenStep
                          onBack={() => setStep('verify')}
                        />
                      )}
                    />
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
