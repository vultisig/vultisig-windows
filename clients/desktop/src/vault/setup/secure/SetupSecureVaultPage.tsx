import { Match } from '../../../lib/ui/base/Match'
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation'
import { MpcServerTypeProvider } from '../../../mpc/serverType/state/mpcServerType'
import { useDefaultMpcLib } from '../../../mpc/state/defaultMpcLib'
import { IsInitiatingDeviceProvider } from '../../../mpc/state/isInitiatingDevice'
import { MpcLibProvider } from '../../../mpc/state/mpcLib'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { KeygenType } from '../../keygen/KeygenType'
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep'
import { MediatorManager } from '../../keygen/shared/peerDiscovery/MediatorManager'
import { GeneratedServiceNameProvider } from '../../keygen/shared/state/currentServiceName'
import { GeneratedSessionIdProvider } from '../../keygen/shared/state/currentSessionId'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'
import { GeneratedLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId'
import { PeersSelectionRecordProvider } from '../../keysign/shared/state/selectedPeers'
import { SetupVaultNameStep } from '../SetupVaultNameStep'
import { SetupVaultCreationStep } from '../shared/SetupVaultCreationStep'
import { VaultTypeProvider } from '../shared/state/vaultType'
import { StartKeygenVaultProvider } from '../StartKeygenVaultProvider'
import { GeneratedHexChainCodeProvider } from '../state/currentHexChainCode'
import { GeneratedHexEncryptionKeyProvider } from '../state/currentHexEncryptionKey'
import { ServerUrlDerivedFromServerTypeProvider } from '../state/serverUrlDerivedFromServerType'
import { SetupVaultNameProvider } from '../state/vaultName'
import { SecureVaultKeygenStartSessionStep } from './SecureVaultKeygenStartSessionStep'
import { SetupSecureVaultPeerDiscoveryStep } from './SetupSecureVaultPeerDiscoveryStep'

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

  const mpcLib = useDefaultMpcLib()

  return (
    <IsInitiatingDeviceProvider value={true}>
      <MpcLibProvider value={mpcLib}>
        <VaultTypeProvider value="secure">
          <GeneratedServiceNameProvider>
            <PeersSelectionRecordProvider initialValue={{}}>
              <GeneratedSessionIdProvider>
                <GeneratedHexEncryptionKeyProvider>
                  <GeneratedHexChainCodeProvider>
                    <MpcServerTypeProvider initialValue="relay">
                      <ServerUrlDerivedFromServerTypeProvider>
                        <GeneratedLocalPartyIdProvider>
                          <SetupVaultNameProvider>
                            <StartKeygenVaultProvider>
                              <CurrentKeygenTypeProvider
                                value={KeygenType.Keygen}
                              >
                                <MediatorManager />
                                <Match
                                  value={step}
                                  name={() => (
                                    <SetupVaultNameStep
                                      onForward={toNextStep}
                                    />
                                  )}
                                  joinSession={() => (
                                    <SecureVaultKeygenStartSessionStep
                                      onBack={toPreviousStep}
                                      onForward={toNextStep}
                                    />
                                  )}
                                  peers={() => (
                                    <SetupSecureVaultPeerDiscoveryStep
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
                    </MpcServerTypeProvider>
                  </GeneratedHexChainCodeProvider>
                </GeneratedHexEncryptionKeyProvider>
              </GeneratedSessionIdProvider>
            </PeersSelectionRecordProvider>
          </GeneratedServiceNameProvider>
        </VaultTypeProvider>
      </MpcLibProvider>
    </IsInitiatingDeviceProvider>
  )
}
