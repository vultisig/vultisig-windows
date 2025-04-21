import { getKeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { JoinMpcSessionStep } from '@core/ui/mpc/keygen/join/JoinMpcSessionStep'
import { WaitMpcSessionStart } from '@core/ui/mpc/session/WaitMpcSessionStart'
import { CurrentHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { MpcPeersProvider } from '@core/ui/mpc/state/mpcPeers'
import { MpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { useMemo } from 'react'

import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { KeysignSigningStep } from '../shared/KeysignSigningStep'
import { KeysignMessagePayloadProvider } from '../shared/state/keysignMessagePayload'
import { KeysignServerUrlProvider } from './KeysignServerUrlProvider'
import { KeysignVaultGuard } from './KeysignVaultGuard'
import { JoinKeysignVerifyStep } from './verify/JoinKeysignVerifyStep'

const keysignSteps = ['verify', 'session', 'sign'] as const

export const JoinKeysignPage = () => {
  const { step, toNextStep, toPreviousStep } = useStepNavigation({
    steps: keysignSteps,
    onExit: useNavigateBack(),
  })

  const { keysignMsg } = useAppPathState<'joinKeysign'>()

  const { sessionId, encryptionKeyHex } = keysignMsg

  const { localPartyId } = useCurrentVault()

  const keysignMessagePayload = useMemo(
    () => getKeysignMessagePayload(keysignMsg),
    [keysignMsg]
  )

  return (
    <IsInitiatingDeviceProvider value={false}>
      <KeysignMessagePayloadProvider value={keysignMessagePayload}>
        <MpcLocalPartyIdProvider value={localPartyId}>
          <KeysignVaultGuard>
            <KeysignServerUrlProvider>
              <MpcSessionIdProvider value={sessionId}>
                <CurrentHexEncryptionKeyProvider value={encryptionKeyHex}>
                  <Match
                    value={step}
                    verify={() => (
                      <JoinKeysignVerifyStep onFinish={toNextStep} />
                    )}
                    session={() => (
                      <JoinMpcSessionStep
                        onFinish={toNextStep}
                        onBack={toPreviousStep}
                      />
                    )}
                    sign={() => (
                      <ValueTransfer<string[]>
                        from={({ onFinish }) => (
                          <WaitMpcSessionStart
                            value="keysign"
                            onFinish={onFinish}
                          />
                        )}
                        to={({ value }) => (
                          <MpcPeersProvider value={value}>
                            <KeysignSigningStep
                              payload={keysignMessagePayload}
                              onBack={toPreviousStep}
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
