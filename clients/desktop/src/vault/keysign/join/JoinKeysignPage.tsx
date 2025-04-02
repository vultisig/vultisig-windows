import { getKeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useMemo } from 'react'

import { MpcLocalPartyIdProvider } from '../../../mpc/localPartyId/state/mpcLocalPartyId'
import { MpcPeersProvider } from '../../../mpc/peers/state/mpcPeers'
import { MpcSessionIdProvider } from '../../../mpc/session/state/mpcSession'
import { IsInitiatingDeviceProvider } from '../../../mpc/state/isInitiatingDevice'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack'
import { JoinKeygenSessionStep } from '../../keygen/shared/JoinKeygenSessionStep'
import { CurrentHexEncryptionKeyProvider } from '../../setup/state/currentHexEncryptionKey'
import { useCurrentVault } from '../../state/currentVault'
import { KeysignSigningStep } from '../shared/KeysignSigningStep'
import { KeysignMessagePayloadProvider } from '../shared/state/keysignMessagePayload'
import { KeysignServerUrlProvider } from './KeysignServerUrlProvider'
import { KeysignVaultGuard } from './KeysignVaultGuard'
import { JoinKeysignVerifyStep } from './verify/JoinKeysignVerifyStep'
import { WaitForKeysignToStart } from './WaitForKeysignToStart'

const keysignSteps = ['verify', 'session', 'sign'] as const

export const JoinKeysignPage = () => {
  const { step, setStep, toNextStep } = useStepNavigation({
    steps: keysignSteps,
    onExit: useNavigateBack(),
  })

  const { keysignMsg } = useAppPathState<'joinKeysign'>()

  const { sessionId, encryptionKeyHex } = keysignMsg

  const { local_party_id } = useCurrentVault()

  const keysignMessagePayload = useMemo(
    () => getKeysignMessagePayload(keysignMsg),
    [keysignMsg]
  )

  return (
    <IsInitiatingDeviceProvider value={false}>
      <KeysignMessagePayloadProvider value={keysignMessagePayload}>
        <MpcLocalPartyIdProvider value={local_party_id}>
          <KeysignVaultGuard>
            <KeysignServerUrlProvider>
              <MpcSessionIdProvider value={sessionId}>
                <CurrentHexEncryptionKeyProvider value={encryptionKeyHex}>
                  <Match
                    value={step}
                    verify={() => (
                      <JoinKeysignVerifyStep onForward={toNextStep} />
                    )}
                    session={() => (
                      <JoinKeygenSessionStep
                        onForward={toNextStep}
                        onBack={() => setStep('verify')}
                      />
                    )}
                    sign={() => (
                      <ValueTransfer<string[]>
                        from={({ onFinish }) => (
                          <WaitForKeysignToStart onFinish={onFinish} />
                        )}
                        to={({ value }) => (
                          <MpcPeersProvider value={value}>
                            <KeysignSigningStep
                              payload={keysignMessagePayload}
                              onBack={() => setStep('verify')}
                            />
                          </MpcPeersProvider>
                        )}
                      />
                    )}
                  />
                </CurrentHexEncryptionKeyProvider>
              </MpcSessionIdProvider>
            </KeysignServerUrlProvider>
          </KeysignVaultGuard>
        </MpcLocalPartyIdProvider>
      </KeysignMessagePayloadProvider>
    </IsInitiatingDeviceProvider>
  )
}
