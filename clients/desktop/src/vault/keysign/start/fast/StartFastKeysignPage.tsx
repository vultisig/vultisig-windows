import { Match } from '../../../../lib/ui/base/Match'
import { StepTransition } from '../../../../lib/ui/base/StepTransition'
import { ValueTransfer } from '../../../../lib/ui/base/ValueTransfer'
import { useStepNavigation } from '../../../../lib/ui/hooks/useStepNavigation'
import { MpcLocalPartyIdProvider } from '../../../../mpc/localPartyId/state/mpcLocalPartyId'
import { MpcPeersProvider } from '../../../../mpc/peers/state/mpcPeers'
import { MpcMediatorManager } from '../../../../mpc/serverType/MpcMediatorManager'
import { MpcServerTypeProvider } from '../../../../mpc/serverType/state/mpcServerType'
import { GeneratedMpcSessionIdProvider } from '../../../../mpc/session/state/mpcSession'
import { IsInitiatingDeviceProvider } from '../../../../mpc/state/isInitiatingDevice'
import { useAppPathState } from '../../../../navigation/hooks/useAppPathState'
import { useNavigateBack } from '../../../../navigation/hooks/useNavigationBack'
import { KeygenStartSessionStep } from '../../../keygen/shared/KeygenStartSessionStep'
import { GeneratedServiceNameProvider } from '../../../keygen/shared/state/currentServiceName'
import { WaitForServerToJoinStep } from '../../../server/components/WaitForServerToJoinStep'
import { ServerPasswordStep } from '../../../server/password/ServerPasswordStep'
import { PasswordProvider } from '../../../server/password/state/password'
import { GeneratedHexEncryptionKeyProvider } from '../../../setup/state/currentHexEncryptionKey'
import { ServerUrlDerivedFromServerTypeProvider } from '../../../setup/state/serverUrlDerivedFromServerType'
import { useCurrentVault } from '../../../state/currentVault'
import { KeysignSigningStep } from '../../shared/KeysignSigningStep'
import { KeysignMessagePayloadProvider } from '../../shared/state/keysignMessagePayload'
import { FastKeysignServerStep } from './FastKeysignServerStep'

const keysignSteps = ['password', 'server', 'keysign'] as const

export const StartFastKeysignPage = () => {
  const { keysignPayload } = useAppPathState<'fastKeysign'>()

  const { local_party_id } = useCurrentVault()

  const { step, toNextStep } = useStepNavigation({
    steps: keysignSteps,
    onExit: useNavigateBack(),
  })

  return (
    <IsInitiatingDeviceProvider value={true}>
      <KeysignMessagePayloadProvider value={keysignPayload}>
        <PasswordProvider initialValue="">
          <MpcLocalPartyIdProvider value={local_party_id}>
            <GeneratedServiceNameProvider>
              <GeneratedMpcSessionIdProvider>
                <GeneratedHexEncryptionKeyProvider>
                  <MpcServerTypeProvider initialValue="relay">
                    <ServerUrlDerivedFromServerTypeProvider>
                      <MpcMediatorManager />
                      <Match
                        value={step}
                        password={() => (
                          <ServerPasswordStep onForward={toNextStep} />
                        )}
                        server={() => (
                          <FastKeysignServerStep onForward={toNextStep} />
                        )}
                        keysign={() => (
                          <ValueTransfer<string[]>
                            from={({ onFinish }) => (
                              <WaitForServerToJoinStep onFinish={onFinish} />
                            )}
                            to={({ value }) => (
                              <MpcPeersProvider value={value}>
                                <StepTransition
                                  from={({ onForward }) => (
                                    <KeygenStartSessionStep
                                      onForward={onForward}
                                    />
                                  )}
                                  to={() => (
                                    <KeysignSigningStep
                                      payload={keysignPayload}
                                    />
                                  )}
                                />
                              </MpcPeersProvider>
                            )}
                          />
                        )}
                      />
                    </ServerUrlDerivedFromServerTypeProvider>
                  </MpcServerTypeProvider>
                </GeneratedHexEncryptionKeyProvider>
              </GeneratedMpcSessionIdProvider>
            </GeneratedServiceNameProvider>
          </MpcLocalPartyIdProvider>
        </PasswordProvider>
      </KeysignMessagePayloadProvider>
    </IsInitiatingDeviceProvider>
  )
}
