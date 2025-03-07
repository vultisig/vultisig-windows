import { Match } from '../../../lib/ui/base/Match'
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation'
import { MpcServerTypeProvider } from '../../../mpc/serverType/state/mpcServerType'
import { useDefaultMpcLib } from '../../../mpc/state/defaultMpcLib'
import { IsInitiatingDeviceProvider } from '../../../mpc/state/isInitiatingDevice'
import { MpcLibProvider } from '../../../mpc/state/mpcLib'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { KeygenType } from '../../keygen/KeygenType'
import { GeneratedServiceNameProvider } from '../../keygen/shared/state/currentServiceName'
import { GeneratedSessionIdProvider } from '../../keygen/shared/state/currentSessionId'
import { CurrentKeygenTypeProvider } from '../../keygen/state/currentKeygenType'
import { GeneratedLocalPartyIdProvider } from '../../keygen/state/currentLocalPartyId'
import { PeersSelectionRecordProvider } from '../../keysign/shared/state/selectedPeers'
import { ServerEmailStep } from '../../server/email/ServerEmailStep'
import { EmailProvider } from '../../server/email/state/email'
import { SetServerPasswordStep } from '../../server/password/SetServerPasswordStep'
import { PasswordProvider } from '../../server/password/state/password'
import { ServerPasswordHintStep } from '../../server/password-hint/ServerPasswordHintStep'
import { PasswordHintProvider } from '../../server/password-hint/state/password-hint'
import { SetupVaultNameStep } from '../SetupVaultNameStep'
import { SetupVaultCreationStep } from '../shared/SetupVaultCreationStep'
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
                                    <PasswordHintProvider initialValue="">
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
                                          <SetupVaultCreationStep
                                            vaultType="fast"
                                            onTryAgain={() => setStep(steps[0])}
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
                            </GeneratedLocalPartyIdProvider>
                          </ServerUrlDerivedFromServerTypeProvider>
                        </MpcServerTypeProvider>
                      </GeneratedHexChainCodeProvider>
                    </GeneratedHexEncryptionKeyProvider>
                  </GeneratedSessionIdProvider>
                </PeersSelectionRecordProvider>
              </GeneratedServiceNameProvider>
            </PasswordProvider>
          </EmailProvider>
        </VaultTypeProvider>
      </MpcLibProvider>
    </IsInitiatingDeviceProvider>
  )
}
