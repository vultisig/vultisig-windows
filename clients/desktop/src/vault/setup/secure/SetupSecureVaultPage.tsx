import { Match } from '../../../lib/ui/base/Match'
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation'
import { GeneratedMpcLocalPartyIdProvider } from '../../../mpc/localPartyId/state/mpcLocalPartyId'
import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { MpcServerTypeProvider } from '../../../mpc/serverType/state/mpcServerType'
import { GeneratedMpcSessionIdProvider } from '../../../mpc/session/state/mpcSession'
import { useDefaultMpcLib } from '../../../mpc/state/defaultMpcLib'
import { IsInitiatingDeviceProvider } from '../../../mpc/state/isInitiatingDevice'
import { MpcLibProvider } from '../../../mpc/state/mpcLib'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { KeygenType } from '../../keygen/KeygenType'
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep'
import { KeygenPeerDiscoveryStep } from '../../keygen/shared/peerDiscovery/KeygenPeerDiscoveryStep'
import { GeneratedServiceNameProvider } from '../../keygen/shared/state/currentServiceName'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'
import { PeersSelectionRecordProvider } from '../../keysign/shared/state/selectedPeers'
import { SetupVaultNameStep } from '../SetupVaultNameStep'
import { SetupVaultCreationStep } from '../shared/SetupVaultCreationStep'
import { VaultTypeProvider } from '../shared/state/vaultType'
import { StartKeygenVaultProvider } from '../StartKeygenVaultProvider'
import { GeneratedHexChainCodeProvider } from '../state/currentHexChainCode'
import { GeneratedHexEncryptionKeyProvider } from '../state/currentHexEncryptionKey'
import { ServerUrlDerivedFromServerTypeProvider } from '../state/serverUrlDerivedFromServerType'
import { SetupVaultNameProvider } from '../state/vaultName'

const steps = ['name', 'peers', 'startSession', 'keygen'] as const

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
              <GeneratedMpcSessionIdProvider>
                <GeneratedHexEncryptionKeyProvider>
                  <GeneratedHexChainCodeProvider>
                    <MpcServerTypeProvider initialValue="relay">
                      <ServerUrlDerivedFromServerTypeProvider>
                        <GeneratedMpcLocalPartyIdProvider>
                          <SetupVaultNameProvider>
                            <StartKeygenVaultProvider>
                              <CurrentKeygenTypeProvider
                                value={KeygenType.Keygen}
                              >
                                <MpcMediatorManager />
                                <Match
                                  value={step}
                                  name={() => (
                                    <SetupVaultNameStep
                                      onForward={toNextStep}
                                    />
                                  )}
                                  peers={() => (
                                    <KeygenPeerDiscoveryStep
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
                        </GeneratedMpcLocalPartyIdProvider>
                      </ServerUrlDerivedFromServerTypeProvider>
                    </MpcServerTypeProvider>
                  </GeneratedHexChainCodeProvider>
                </GeneratedHexEncryptionKeyProvider>
              </GeneratedMpcSessionIdProvider>
            </PeersSelectionRecordProvider>
          </GeneratedServiceNameProvider>
        </VaultTypeProvider>
      </MpcLibProvider>
    </IsInitiatingDeviceProvider>
  )
}
