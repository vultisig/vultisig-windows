import { KeygenType } from '@core/mpc/keygen/KeygenType'

import { Match } from '../../../lib/ui/base/Match'
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation'
import { GeneratedMpcLocalPartyIdProvider } from '../../../mpc/localPartyId/state/mpcLocalPartyId'
import { MpcPeersSelectionProvider } from '../../../mpc/peers/state/mpcSelectedPeers'
import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { MpcServerTypeProvider } from '../../../mpc/serverType/state/mpcServerType'
import { GeneratedMpcSessionIdProvider } from '../../../mpc/session/state/mpcSession'
import { useDefaultMpcLib } from '../../../mpc/state/defaultMpcLib'
import { IsInitiatingDeviceProvider } from '../../../mpc/state/isInitiatingDevice'
import { MpcLibProvider } from '../../../mpc/state/mpcLib'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { KeygenFlow } from '../../keygen/shared/KeygenFlow'
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep'
import { KeygenPeerDiscoveryStep } from '../../keygen/shared/peerDiscovery/KeygenPeerDiscoveryStep'
import { GeneratedServiceNameProvider } from '../../keygen/shared/state/currentServiceName'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'
import { SetupVaultNameStep } from '../SetupVaultNameStep'
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
            <MpcPeersSelectionProvider>
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
                                    <KeygenFlow
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
            </MpcPeersSelectionProvider>
          </GeneratedServiceNameProvider>
        </VaultTypeProvider>
      </MpcLibProvider>
    </IsInitiatingDeviceProvider>
  )
}
