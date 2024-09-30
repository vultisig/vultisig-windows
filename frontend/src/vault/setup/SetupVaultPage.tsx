import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { getHexEncodedRandomBytes } from '../../chain/utils/getHexEncodedRandomBytes';
import { Match } from '../../lib/ui/base/Match';
import { VStack } from '../../lib/ui/layout/Stack';
import { SetupVaultView } from '../../pages/setupVault/SetupVaultView';
import { useGenerateVaultName } from '../hooks/useGenerateVaultName';
import { CurrentLocalPartyIdProvider } from '../keygen/state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../keygen/state/currentServerType';
import { generateServiceName } from '../keygen/utils/generateServiceName';
import { generateLocalPartyId } from '../keygen/utils/localPartyId';
import { SetupVaultPeerDiscoveryStep } from './peerDiscovery/SetupVaultPeerDiscoveryStep';
import { SetupVaultNameStep } from './SetupVaultNameStep';
import { CurrentHexChainCodeProvider } from './state/currentHexChainCode';
import { CurrentHexEncryptionKeyProvider } from './state/currentHexEncryptionKey';
import { CurrentPeersProvider } from './state/currentPeers';
import { CurrentServiceNameProvider } from './state/currentServiceName';
import { CurrentSessionIdProvider } from './state/currentSessionId';
import { VaultNameProvider } from './state/vaultName';

const setupVaultSteps = ['name', 'peers', 'setup'] as const;
type SetupVaultStep = (typeof setupVaultSteps)[number];

export const SetupVaultPage = () => {
  const generateVaultName = useGenerateVaultName();
  const initialVaultName = useMemo(generateVaultName, [generateVaultName]);

  const localPartyId = useMemo(generateLocalPartyId, []);

  const hexChainCode = useMemo(() => getHexEncodedRandomBytes(32), []);
  const hexEncryptionKey = useMemo(() => getHexEncodedRandomBytes(32), []);

  const serviceName = useMemo(generateServiceName, []);

  const sessionId = useMemo(uuidv4, []);

  const [step, setStep] = useState<SetupVaultStep>(setupVaultSteps[0]);

  return (
    <CurrentServiceNameProvider value={serviceName}>
      <CurrentPeersProvider initialValue={[]}>
        <CurrentSessionIdProvider value={sessionId}>
          <CurrentHexEncryptionKeyProvider value={hexEncryptionKey}>
            <CurrentHexChainCodeProvider value={hexChainCode}>
              <CurrentServerTypeProvider initialValue="relay">
                <CurrentLocalPartyIdProvider value={localPartyId}>
                  <VaultNameProvider initialValue={initialVaultName}>
                    <VStack flexGrow>
                      <Match
                        value={step}
                        name={() => (
                          <SetupVaultNameStep
                            onForward={() => setStep('peers')}
                          />
                        )}
                        peers={() => (
                          <SetupVaultPeerDiscoveryStep
                            onBack={() => setStep('name')}
                            onForward={() => setStep('setup')}
                          />
                        )}
                        setup={() => (
                          <SetupVaultView onBack={() => setStep('peers')} />
                        )}
                      />
                    </VStack>
                  </VaultNameProvider>
                </CurrentLocalPartyIdProvider>
              </CurrentServerTypeProvider>
            </CurrentHexChainCodeProvider>
          </CurrentHexEncryptionKeyProvider>
        </CurrentSessionIdProvider>
      </CurrentPeersProvider>
    </CurrentServiceNameProvider>
  );
};
