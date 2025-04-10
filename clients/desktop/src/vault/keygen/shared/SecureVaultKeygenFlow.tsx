import { KeygenVaultProvider } from '@core/ui/mpc/keygen/state/keygenVault'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'

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
import { ReshareVerifyStep } from '../../reshare/shared/ReshareVerifyStep'
import { VaultTypeProvider } from '../../setup/shared/state/vaultType'
import { CurrentHexChainCodeProvider } from '../../setup/state/currentHexChainCode'
import { GeneratedHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey'
import { ServerUrlDerivedFromServerTypeProvider } from '../../setup/state/serverUrlDerivedFromServerType'
import { useCurrentVault } from '../../state/currentVault'

const reshareVaultSteps = [
  'joinSession',
  'peers',
  'verify',
  'startSession',
  'keygen',
] as const

export const SecureVaultKeygenFlow = () => {
  const vault = useCurrentVault()
  const { localPartyId, hexChainCode, libType } = vault

  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps: reshareVaultSteps,
    onExit: useNavigateBack(),
  })

  return (
    <IsInitiatingDeviceProvider value={true}>
      <MpcLibProvider value={libType}>
        <VaultTypeProvider value="secure">
          <GeneratedServiceNameProvider>
            <MpcPeersSelectionProvider>
              <GeneratedMpcSessionIdProvider>
                <GeneratedHexEncryptionKeyProvider>
                  <CurrentHexChainCodeProvider value={hexChainCode}>
                    <MpcServerTypeProvider initialValue="relay">
                      <ServerUrlDerivedFromServerTypeProvider>
                        <MpcLocalPartyIdProvider value={localPartyId}>
                          <KeygenVaultProvider value={{ existingVault: vault }}>
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
                          </KeygenVaultProvider>
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
