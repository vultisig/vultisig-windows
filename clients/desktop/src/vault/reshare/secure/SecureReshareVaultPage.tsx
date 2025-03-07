import { MpcLib } from '@core/mpc/mpcLib'
import { useTranslation } from 'react-i18next'

import { Match } from '../../../lib/ui/base/Match'
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation'
import { MpcServerTypeProvider } from '../../../mpc/serverType/state/mpcServerType'
import { IsInitiatingDeviceProvider } from '../../../mpc/state/isInitiatingDevice'
import { MpcLibProvider } from '../../../mpc/state/mpcLib'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { KeygenType } from '../../keygen/KeygenType'
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep'
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep'
import { KeygenStep } from '../../keygen/shared/KeygenStep'
import { MediatorManager } from '../../keygen/shared/peerDiscovery/MediatorManager'
import { GeneratedServiceNameProvider } from '../../keygen/shared/state/currentServiceName'
import { GeneratedSessionIdProvider } from '../../keygen/shared/state/currentSessionId'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'
import { CurrentKeygenVaultProvider } from '../../keygen/state/currentKeygenVault'
import { CurrentLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId'
import { PeersSelectionRecordProvider } from '../../keysign/shared/state/selectedPeers'
import { VaultTypeProvider } from '../../setup/shared/state/vaultType'
import { CurrentHexChainCodeProvider } from '../../setup/state/currentHexChainCode'
import { GeneratedHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey'
import { ServerUrlDerivedFromServerTypeProvider } from '../../setup/state/serverUrlDerivedFromServerType'
import { useCurrentVault } from '../../state/currentVault'
import { ReshareVaultPeerDiscoveryStep } from '../ReshareVaultPeerDiscoveryStep'
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

  const { t } = useTranslation()

  return (
    <IsInitiatingDeviceProvider value={true}>
      <MpcLibProvider value={lib_type as MpcLib}>
        <VaultTypeProvider value="secure">
          <GeneratedServiceNameProvider>
            <PeersSelectionRecordProvider initialValue={{}}>
              <GeneratedSessionIdProvider>
                <GeneratedHexEncryptionKeyProvider>
                  <CurrentHexChainCodeProvider value={hex_chain_code}>
                    <MpcServerTypeProvider initialValue="relay">
                      <ServerUrlDerivedFromServerTypeProvider>
                        <CurrentLocalPartyIdProvider value={local_party_id}>
                          <CurrentKeygenTypeProvider value={KeygenType.Reshare}>
                            <CurrentKeygenVaultProvider value={vault}>
                              <MediatorManager />
                              <Match
                                value={step}
                                joinSession={() => (
                                  <JoinKeygenSessionStep
                                    onForward={toNextStep}
                                  />
                                )}
                                peers={() => (
                                  <ReshareVaultPeerDiscoveryStep
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
                                  <KeygenStep
                                    title={t('reshare')}
                                    onTryAgain={() =>
                                      setStep(reshareVaultSteps[0])
                                    }
                                    onBack={() => setStep('verify')}
                                  />
                                )}
                              />
                            </CurrentKeygenVaultProvider>
                          </CurrentKeygenTypeProvider>
                        </CurrentLocalPartyIdProvider>
                      </ServerUrlDerivedFromServerTypeProvider>
                    </MpcServerTypeProvider>
                  </CurrentHexChainCodeProvider>
                </GeneratedHexEncryptionKeyProvider>
              </GeneratedSessionIdProvider>
            </PeersSelectionRecordProvider>
          </GeneratedServiceNameProvider>
        </VaultTypeProvider>
      </MpcLibProvider>
    </IsInitiatingDeviceProvider>
  )
}
