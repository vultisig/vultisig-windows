import { KeygenVaultProvider } from '@core/ui/mpc/keygen/state/keygenVault'
import { CurrentHexChainCodeProvider } from '@core/ui/mpc/state/currentHexChainCode'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { GeneratedMpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { ServerUrlDerivedFromServerTypeProvider } from '@core/ui/mpc/state/serverUrlDerivedFromServerType'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep'
import { KeygenFlow } from '../../keygen/shared/KeygenFlow'
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep'
import { KeygenPeerDiscoveryStep } from '../../keygen/shared/peerDiscovery/KeygenPeerDiscoveryStep'
import { ReshareVerifyStep } from '../../reshare/shared/ReshareVerifyStep'
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
  const { localPartyId, hexChainCode } = vault

  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps: reshareVaultSteps,
    onExit: useNavigateBack(),
  })

  return (
    <IsInitiatingDeviceProvider value={true}>
      <GeneratedMpcServiceNameProvider>
        <MpcPeersSelectionProvider>
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
                        <KeygenPeerDiscoveryStep onForward={toNextStep} />
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
        </MpcPeersSelectionProvider>
      </GeneratedMpcServiceNameProvider>
    </IsInitiatingDeviceProvider>
  )
}
