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
import { GeneratedServiceNameProvider } from '../../keygen/shared/state/currentServiceName'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'
import { ServerEmailStep } from '../../server/email/ServerEmailStep'
import { EmailProvider } from '../../server/email/state/email'
import { SetServerPasswordStep } from '../../server/password/SetServerPasswordStep'
import { PasswordProvider } from '../../server/password/state/password'
import { ServerPasswordHintStep } from '../../server/password-hint/ServerPasswordHintStep'
import { PasswordHintProvider } from '../../server/password-hint/state/password-hint'
import { SetupVaultNameStep } from '../SetupVaultNameStep'
import { VaultTypeProvider } from '../shared/state/vaultType'
import { StartKeygenVaultProvider } from '../StartKeygenVaultProvider'
import { GeneratedHexChainCodeProvider } from '../state/currentHexChainCode'
import { GeneratedHexEncryptionKeyProvider } from '../state/currentHexEncryptionKey'
import { ServerUrlDerivedFromServerTypeProvider } from '../state/serverUrlDerivedFromServerType'
import { SetupVaultNameProvider } from '../state/vaultName'
import { SetupVaultServerStep } from './SetupVaultServerStep'

const steps = [
  'name',
  'email',
  'password',
  'hint',
  'setupForCreateVault',
  'createVault',
] as const

const lastEditableStep = 'password'

export const SetupFastVaultPage = () => {
  const { step, setStep, toPreviousStep, toNextStep } = useStepNavigation({
    steps,
    onExit: useNavigateBack(),
  })

  const mpcLib = useDefaultMpcLib()

  return (
    <IsInitiatingDeviceProvider value={true}>
      <MpcLibProvider value={mpcLib}>
        <VaultTypeProvider value="fast">
          <EmailProvider initialValue="">
            <PasswordProvider initialValue="">
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
                                    <PasswordHintProvider initialValue="">
                                      <MpcMediatorManager />
                                      <Match
                                        value={step}
                                        name={() => (
                                          <SetupVaultNameStep
                                            onForward={toNextStep}
                                          />
                                        )}
                                        email={() => (
                                          <ServerEmailStep
                                            onBack={toPreviousStep}
                                            onForward={toNextStep}
                                          />
                                        )}
                                        password={() => (
                                          <SetServerPasswordStep
                                            onBack={toPreviousStep}
                                            onForward={toNextStep}
                                          />
                                        )}
                                        hint={() => (
                                          <ServerPasswordHintStep
                                            onBack={toPreviousStep}
                                            onForward={toNextStep}
                                          />
                                        )}
                                        setupForCreateVault={() => (
                                          <SetupVaultServerStep
                                            onBack={() =>
                                              setStep(lastEditableStep)
                                            }
                                            onForward={toNextStep}
                                          />
                                        )}
                                        createVault={() => (
                                          <KeygenFlow
                                            onBack={() =>
                                              setStep(lastEditableStep)
                                            }
                                          />
                                        )}
                                      />
                                    </PasswordHintProvider>
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
            </PasswordProvider>
          </EmailProvider>
        </VaultTypeProvider>
      </MpcLibProvider>
    </IsInitiatingDeviceProvider>
  )
}
