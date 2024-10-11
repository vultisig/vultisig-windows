import { useCallback, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { getHexEncodedRandomBytes } from '../../chain/utils/getHexEncodedRandomBytes';
import { Match } from '../../lib/ui/base/Match';
import { VStack } from '../../lib/ui/layout/Stack';
import { useGenerateVaultName } from '../hooks/useGenerateVaultName';
import { defaultKeygenThresholdType } from '../keygen/KeygenThresholdType';
import { KeygenStartSessionStep } from '../keygen/shared/KeygenStartSessionStep';
import { CurrentSessionIdProvider } from '../keygen/shared/state/currentSessionId';
import { CurrentLocalPartyIdProvider } from '../keygen/state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../keygen/state/currentServerType';
import { generateServiceName } from '../keygen/utils/generateServiceName';
import { generateLocalPartyId } from '../keygen/utils/localPartyId';
import { PeersSelectionRecordProvider } from '../keysign/shared/state/selectedPeers';
import { SetupVaultKeygenThresholdStep } from './keygenThreshold/SetupVaultKeygenThresholdStep';
import { SetupVaultPeerDiscoveryStep } from './peerDiscovery/SetupVaultPeerDiscoveryStep';
import { SetupVaultKeygenStep } from './SetupVaultKeygenStep';
import { SetupVaultNameStep } from './SetupVaultNameStep';
import { CurrentHexChainCodeProvider } from './state/currentHexChainCode';
import { CurrentHexEncryptionKeyProvider } from './state/currentHexEncryptionKey';
import { CurrentKeygenThresholdProvider } from './state/currentKeygenThreshold';
import { CurrentServiceNameProvider } from './state/currentServiceName';
import { ServerUrlDerivedFromServerTypeProvider } from './state/serverUrlDerivedFromServerType';
import { VaultNameProvider } from './state/vaultName';
import { SetupVaultVerifyStep } from './verify/SetupVaultVerifyStep';

const setupVaultSteps = [
  'threshold',
  'name',
  'peers',
  'verify',
  'startSession',
  'keygen',
] as const;
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

  const toNextStep = useCallback(() => {
    setStep(prev => setupVaultSteps[setupVaultSteps.indexOf(prev) + 1]);
  }, []);

  const toPreviousStep = useCallback(() => {
    setStep(prev => setupVaultSteps[setupVaultSteps.indexOf(prev) - 1]);
  }, []);

  return (
    <CurrentKeygenThresholdProvider initialValue={defaultKeygenThresholdType}>
      <CurrentServiceNameProvider value={serviceName}>
        <PeersSelectionRecordProvider initialValue={{}}>
          <CurrentSessionIdProvider value={sessionId}>
            <CurrentHexEncryptionKeyProvider value={hexEncryptionKey}>
              <CurrentHexChainCodeProvider value={hexChainCode}>
                <CurrentServerTypeProvider initialValue="relay">
                  <ServerUrlDerivedFromServerTypeProvider>
                    <CurrentLocalPartyIdProvider value={localPartyId}>
                      <VaultNameProvider initialValue={initialVaultName}>
                        <VStack flexGrow>
                          <Match
                            value={step}
                            threshold={() => (
                              <SetupVaultKeygenThresholdStep
                                onForward={toNextStep}
                              />
                            )}
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
                        </VStack>
                      </VaultNameProvider>
                    </CurrentLocalPartyIdProvider>
                  </ServerUrlDerivedFromServerTypeProvider>
                </CurrentServerTypeProvider>
              </CurrentHexChainCodeProvider>
            </CurrentHexEncryptionKeyProvider>
          </CurrentSessionIdProvider>
        </PeersSelectionRecordProvider>
      </CurrentServiceNameProvider>
    </CurrentKeygenThresholdProvider>
  );
};
