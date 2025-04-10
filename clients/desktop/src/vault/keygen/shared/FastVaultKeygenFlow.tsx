import { KeygenVaultProvider } from '@core/ui/mpc/keygen/state/keygenVault'
import { CurrentHexChainCodeProvider } from '@core/ui/mpc/state/currentHexChainCode'
import { GeneratedHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { MpcPeersSelectionProvider } from '@core/ui/mpc/state/mpcSelectedPeers'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { GeneratedMpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { GeneratedMpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { ServerUrlDerivedFromServerTypeProvider } from '@core/ui/mpc/state/serverUrlDerivedFromServerType'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep'
import { KeygenFlow } from '../../keygen/shared/KeygenFlow'
import { KeygenStartSessionStep } from '../../keygen/shared/KeygenStartSessionStep'
import { KeygenPeerDiscoveryStep } from '../../keygen/shared/peerDiscovery/KeygenPeerDiscoveryStep'
import { MigrateVaultKeygenActionProvider } from '../../migrate/MigrateVaultKeygenActionProvider'
import { ReshareVerifyStep } from '../../reshare/shared/ReshareVerifyStep'
import { ServerEmailStep } from '../../server/email/ServerEmailStep'
import { EmailProvider } from '../../server/email/state/email'
import { ServerPasswordStep } from '../../server/password/ServerPasswordStep'
import { SetServerPasswordStep } from '../../server/password/SetServerPasswordStep'
import { PasswordProvider } from '../../server/password/state/password'
import { useCurrentVault, useVaultServerStatus } from '../../state/currentVault'
import { KeygenServerStep } from './KeygenServerStep'

const reshareVaultSteps = [
  'email',
  'password',
  'joinSession',
  'server',
  'peers',
  'verify',
  'startSession',
  'keygen',
] as const

export const FastVaultKeygenFlow = () => {
  const vault = useCurrentVault()
  const { localPartyId, hexChainCode } = vault

  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps: reshareVaultSteps,
    onExit: useNavigateBack(),
  })

  const { hasServer, isBackup } = useVaultServerStatus()

  return (
    <IsInitiatingDeviceProvider value={true}>
      <EmailProvider initialValue="">
        <PasswordProvider initialValue="">
          <GeneratedMpcServiceNameProvider>
            <MpcPeersSelectionProvider>
              <GeneratedMpcSessionIdProvider>
                <GeneratedHexEncryptionKeyProvider>
                  <CurrentHexChainCodeProvider value={hexChainCode}>
                    <MpcServerTypeProvider initialValue="relay">
                      <ServerUrlDerivedFromServerTypeProvider>
                        <MpcLocalPartyIdProvider value={localPartyId}>
                          <KeygenVaultProvider value={{ existingVault: vault }}>
                            <MigrateVaultKeygenActionProvider>
                              <MpcMediatorManager />
                              <Match
                                value={step}
                                email={() => (
                                  <ServerEmailStep onForward={toNextStep} />
                                )}
                                password={() =>
                                  hasServer && !isBackup ? (
                                    <ServerPasswordStep
                                      onForward={toNextStep}
                                    />
                                  ) : (
                                    <SetServerPasswordStep
                                      onForward={toNextStep}
                                    />
                                  )
                                }
                                server={() => (
                                  <KeygenServerStep onFinish={toNextStep} />
                                )}
                                joinSession={() => (
                                  <JoinKeygenSessionStep
                                    onForward={toNextStep}
                                  />
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
                                  <KeygenFlow
                                    onBack={() => setStep('verify')}
                                  />
                                )}
                              />
                            </MigrateVaultKeygenActionProvider>
                          </KeygenVaultProvider>
                        </MpcLocalPartyIdProvider>
                      </ServerUrlDerivedFromServerTypeProvider>
                    </MpcServerTypeProvider>
                  </CurrentHexChainCodeProvider>
                </GeneratedHexEncryptionKeyProvider>
              </GeneratedMpcSessionIdProvider>
            </MpcPeersSelectionProvider>
          </GeneratedMpcServiceNameProvider>
        </PasswordProvider>
      </EmailProvider>
    </IsInitiatingDeviceProvider>
  )
}
