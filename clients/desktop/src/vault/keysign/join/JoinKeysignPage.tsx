import { getKeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { CurrentHexEncryptionKeyProvider } from '@core/ui/mpc/state/currentHexEncryptionKey'
import { IsInitiatingDeviceProvider } from '@core/ui/mpc/state/isInitiatingDevice'
import { MpcLocalPartyIdProvider } from '@core/ui/mpc/state/mpcLocalPartyId'
import { MpcSessionIdProvider } from '@core/ui/mpc/state/mpcSession'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { useMemo } from 'react'

import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { KeysignSigningStep } from '../shared/KeysignSigningStep'
import { KeysignMessagePayloadProvider } from '../shared/state/keysignMessagePayload'
import { KeysignServerUrlProvider } from './KeysignServerUrlProvider'
import { KeysignVaultGuard } from './KeysignVaultGuard'
import { JoinKeysignVerifyStep } from './verify/JoinKeysignVerifyStep'

export const JoinKeysignPage = () => {
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
                  <StepTransition
                    from={({ onFinish }) => (
                      <JoinKeysignVerifyStep onFinish={onFinish} />
                    )}
                    to={({ onBack }) => (
                      <KeysignSigningStep
                        payload={keysignMessagePayload}
                        onBack={onBack}
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
