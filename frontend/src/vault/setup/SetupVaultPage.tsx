import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { getHexEncodedRandomBytes } from '../../chain/utils/getHexEncodedRandomBytes';
import { Match } from '../../lib/ui/base/Match';
import { useStepNavigation } from '../../lib/ui/hooks/useStepNavigation';
import { useGenerateVaultName } from '../hooks/useGenerateVaultName';
import { defaultKeygenThresholdType } from '../keygen/KeygenThresholdType';
import { KeygenType } from '../keygen/KeygenType';
import { KeygenStartSessionStep } from '../keygen/shared/KeygenStartSessionStep';
import { KeygenStep } from '../keygen/shared/KeygenStep';
import { CurrentServiceNameProvider } from '../keygen/shared/state/currentServiceName';
import { CurrentSessionIdProvider } from '../keygen/shared/state/currentSessionId';
import { KeygenVerifyStep } from '../keygen/shared/verify/KeygenVerifyStep';
import { CurrentKeygenTypeProvider } from '../keygen/state/currentKeygenType';
import { CurrentLocalPartyIdProvider } from '../keygen/state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../keygen/state/currentServerType';
import { generateHexEncryptionKey } from '../keygen/utils/generateHexEncryptionKey';
import { generateServiceName } from '../keygen/utils/generateServiceName';
import { generateLocalPartyId } from '../keygen/utils/localPartyId';
import { PeersSelectionRecordProvider } from '../keysign/shared/state/selectedPeers';
import { SetupVaultKeygenThresholdStep } from './keygenThreshold/SetupVaultKeygenThresholdStep';
import { SetupVaultPeerDiscoveryStep } from './peers/SetupVaultPeerDiscoveryStep';
import { SetupVaultNameStep } from './SetupVaultNameStep';
import { StartKeygenVaultProvider } from './StartKeygenVaultProvider';
import { CurrentHexChainCodeProvider } from './state/currentHexChainCode';
import { CurrentHexEncryptionKeyProvider } from './state/currentHexEncryptionKey';
import { CurrentKeygenThresholdProvider } from './state/currentKeygenThreshold';
import { ServerUrlDerivedFromServerTypeProvider } from './state/serverUrlDerivedFromServerType';
import { VaultNameProvider } from './state/vaultName';

const setupVaultSteps = [
  'threshold',
  'name',
  'peers',
  'verify',
  'startSession',
  'keygen',
] as const;

export const SetupVaultPage = () => {
  const generateVaultName = useGenerateVaultName();
  const initialVaultName = useMemo(generateVaultName, [generateVaultName]);

  const localPartyId = useMemo(generateLocalPartyId, []);

  const hexChainCode = useMemo(() => getHexEncodedRandomBytes(32), []);
  const hexEncryptionKey = useMemo(generateHexEncryptionKey, []);

  const serviceName = useMemo(generateServiceName, []);

  const sessionId = useMemo(uuidv4, []);

  const { step, setStep, toPreviousStep, toNextStep } =
    useStepNavigation(setupVaultSteps);

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
                        <StartKeygenVaultProvider>
                          <CurrentKeygenTypeProvider value={KeygenType.Keygen}>
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
                                  onTryAgain={() => setStep(setupVaultSteps[0])}
                                  onBack={() => setStep('verify')}
                                />
                              )}
                            />
                          </CurrentKeygenTypeProvider>
                        </StartKeygenVaultProvider>
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
