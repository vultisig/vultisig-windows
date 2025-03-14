import { Match } from '../../../../lib/ui/base/Match'
import { useStepNavigation } from '../../../../lib/ui/hooks/useStepNavigation'
import { MpcLocalPartyIdProvider } from '../../../../mpc/localPartyId/state/mpcLocalPartyId'
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
import { PeersSelectionRecordProvider } from '../../shared/state/selectedPeers'
import { FastKeysignServerStep } from './FastKeysignServerStep'

const keysignSteps = [
  'password',
  'server',
  'waitServer',
  'startSession',
  'sign',
] as const

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
              <PeersSelectionRecordProvider initialValue={{}}>
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
                          startSession={() => (
                            <KeygenStartSessionStep onForward={toNextStep} />
                          )}
                          waitServer={() => (
                            <WaitForServerToJoinStep onForward={toNextStep} />
                          )}
                          server={() => (
                            <FastKeysignServerStep onForward={toNextStep} />
                          )}
                          sign={() => (
                            <KeysignSigningStep payload={keysignPayload} />
                          )}
                        />
                      </ServerUrlDerivedFromServerTypeProvider>
                    </MpcServerTypeProvider>
                  </GeneratedHexEncryptionKeyProvider>
                </GeneratedMpcSessionIdProvider>
              </PeersSelectionRecordProvider>
            </GeneratedServiceNameProvider>
          </MpcLocalPartyIdProvider>
        </PasswordProvider>
      </KeysignMessagePayloadProvider>
    </IsInitiatingDeviceProvider>
  )
}
