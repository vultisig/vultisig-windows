import { GeneratedHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { GeneratedMpcServiceNameProvider } from '@core/ui/mpc/state/mpcServiceName'
import { GeneratedMpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { ServerUrlDerivedFromServerTypeProvider } from '@core/ui/mpc/state/serverUrlDerivedFromServerType'
import { Match } from '@lib/ui/base/Match'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'

import { MpcMediatorManager } from '../../../../mpc/serverType/MpcMediatorManager'
import { useAppPathState } from '../../../../navigation/hooks/useAppPathState'
import { useNavigateBack } from '../../../../navigation/hooks/useNavigationBack'
import { KeygenStartSessionStep } from '../../../keygen/shared/KeygenStartSessionStep'
import { WaitForServerToJoinStep } from '../../../server/components/WaitForServerToJoinStep'
import { ServerPasswordStep } from '../../../server/password/ServerPasswordStep'
import { PasswordProvider } from '@core/ui/state/password'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { KeysignSigningStep } from '../../shared/KeysignSigningStep'
import { KeysignMessagePayloadProvider } from '../../shared/state/keysignMessagePayload'
import { FastKeysignServerStep } from './FastKeysignServerStep'

const keysignSteps = ['password', 'server', 'keysign'] as const

export const StartFastKeysignPage = () => {
  const { keysignPayload } = useAppPathState<'fastKeysign'>()

  const { localPartyId } = useCurrentVault()

  const { step, toNextStep } = useStepNavigation({
    steps: keysignSteps,
    onExit: useNavigateBack(),
  })

  return (
    <IsInitiatingDeviceProvider value={true}>
      <KeysignMessagePayloadProvider value={keysignPayload}>
        <PasswordProvider initialValue="">
          <MpcLocalPartyIdProvider value={localPartyId}>
            <GeneratedMpcServiceNameProvider>
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
            </GeneratedMpcServiceNameProvider>
          </MpcLocalPartyIdProvider>
        </PasswordProvider>
      </KeysignMessagePayloadProvider>
    </IsInitiatingDeviceProvider>
  )
}
