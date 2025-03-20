import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { MpcLib } from '@core/mpc/mpcLib'

import { Match } from '../../../lib/ui/base/Match'
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation'
import { MpcLocalPartyIdProvider } from '../../../mpc/localPartyId/state/mpcLocalPartyId'
import { MpcPeersSelectionProvider } from '../../../mpc/peers/state/mpcSelectedPeers'
import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { MpcServerTypeProvider } from '../../../mpc/serverType/state/mpcServerType'
import { GeneratedMpcSessionIdProvider } from '../../../mpc/session/state/mpcSession'
import { IsInitiatingDeviceProvider } from '../../../mpc/state/isInitiatingDevice'
import { MpcLibProvider } from '../../../mpc/state/mpcLib'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep'
import { KeygenFlow } from '../../keygen/shared/KeygenFlow'
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep'
import { KeygenPeerDiscoveryStep } from '../../keygen/shared/peerDiscovery/KeygenPeerDiscoveryStep'
import { GeneratedServiceNameProvider } from '../../keygen/shared/state/currentServiceName'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'
import { VaultTypeProvider } from '../../setup/shared/state/vaultType'
import { CurrentHexChainCodeProvider } from '../../setup/state/currentHexChainCode'
import { GeneratedHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey'
import { ServerUrlDerivedFromServerTypeProvider } from '../../setup/state/serverUrlDerivedFromServerType'
import { useCurrentVault } from '../../state/currentVault'
import { ReshareVerifyStep } from '../shared/ReshareVerifyStep'

const reshareVaultSteps = [
  'joinSession',
  'peers',
  'verify',
  'startSession',
  'keygen',
] as const

export const SecureReshareVaultPage = () => {
  const vault = useCurrentVault()
  const { local_party_id, hex_chain_code, lib_type } = vault

  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps: reshareVaultSteps,
    onExit: useNavigateBack(),
  })

  return (
    <IsInitiatingDeviceProvider value={true}>
      <MpcLibProvider value={lib_type as MpcLib}>
        <VaultTypeProvider value="secure">
          <GeneratedServiceNameProvider>
            <MpcPeersSelectionProvider>
              <GeneratedMpcSessionIdProvider>
                <GeneratedHexEncryptionKeyProvider>
                  <CurrentHexChainCodeProvider value={hex_chain_code}>
                    <MpcServerTypeProvider initialValue="relay">
                      <ServerUrlDerivedFromServerTypeProvider>
                        <MpcLocalPartyIdProvider value={local_party_id}>
                          <CurrentKeygenTypeProvider value={KeygenType.Reshare}>
                            <MpcMediatorManager />
                            <Match
                              value={step}
                              joinSession={() => (
                                <JoinKeygenSessionStep onForward={toNextStep} />
                              )}
                              peers={() => (
                                <KeygenPeerDiscoveryStep
                                  onForward={toNextStep}
                                />
                              )}
                              verify={() => (
                                <ReshareVerifyStep
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
                                <KeygenFlow onBack={() => setStep('verify')} />
                              )}
                            />
                          </CurrentKeygenTypeProvider>
                        </MpcLocalPartyIdProvider>
                      </ServerUrlDerivedFromServerTypeProvider>
                    </MpcServerTypeProvider>
                  </CurrentHexChainCodeProvider>
                </GeneratedHexEncryptionKeyProvider>
              </GeneratedMpcSessionIdProvider>
            </MpcPeersSelectionProvider>
          </GeneratedServiceNameProvider>
        </VaultTypeProvider>
      </MpcLibProvider>
    </IsInitiatingDeviceProvider>
  )
}
