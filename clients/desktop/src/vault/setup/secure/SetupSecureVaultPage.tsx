import { Match } from '../../../lib/ui/base/Match'
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { KeygenType } from '../../keygen/KeygenType'
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep'
import { MediatorManager } from '../../keygen/shared/peerDiscovery/MediatorManager'
import { GeneratedServiceNameProvider } from '../../keygen/shared/state/currentServiceName'
import { GeneratedSessionIdProvider } from '../../keygen/shared/state/currentSessionId'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'
import { GeneratedLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId'
import { CurrentServerTypeProvider } from '../../keygen/state/currentServerType'
import { PeersSelectionRecordProvider } from '../../keysign/shared/state/selectedPeers'
import { SetupVaultPeerDiscoveryStep } from '../peers/SetupVaultPeerDiscoveryStep'
import { SetupVaultNameStep } from '../SetupVaultNameStep'
import { SetupVaultCreationStep } from '../shared/SetupVaultCreationStep'
import { VaultTypeProvider } from '../shared/state/vaultType'
import { StartKeygenVaultProvider } from '../StartKeygenVaultProvider'
import { GeneratedHexChainCodeProvider } from '../state/currentHexChainCode'
import { GeneratedHexEncryptionKeyProvider } from '../state/currentHexEncryptionKey'
import { ServerUrlDerivedFromServerTypeProvider } from '../state/serverUrlDerivedFromServerType'
import { SetupVaultNameProvider } from '../state/vaultName'
import { SecureVaultKeygenStartSessionStep } from './SecureVaultKeygenStartSessionStep'

const steps = [
  'name',
  'joinSession',
  'peers',
  'startSession',
  'keygen',
] as const

const lastEditableStep = steps[0]

export const SetupSecureVaultPage = () => {
  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps,
    onExit: useNavigateBack(),
  })

  return (
    <VaultTypeProvider value="secure">
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
                            <MediatorManager />
                            <Match
                              value={step}
                              name={() => (
                                <SetupVaultNameStep onForward={toNextStep} />
                              )}
                              joinSession={() => (
                                <SecureVaultKeygenStartSessionStep
                                  onBack={toPreviousStep}
                                  onForward={toNextStep}
                                />
                              )}
                              peers={() => (
                                <SetupVaultPeerDiscoveryStep
                                  onBack={() => setStep(steps[0])}
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
                                <SetupVaultCreationStep
                                  vaultType="secure"
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
    </VaultTypeProvider>
  )
}
