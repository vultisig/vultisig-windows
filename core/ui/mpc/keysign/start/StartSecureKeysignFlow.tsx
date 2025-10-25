import { KeysignSigningStep } from '@core/ui/mpc/keysign/KeysignSigningStep'
import { KeysignActionProviderProp } from '@core/ui/mpc/keysign/start/KeysignActionProviderProp'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { MpcSignersProvider } from '../../state/mpcSigners'
import { KeysignSignersStep } from '../signers/KeysignSignersStep'
import { KeysignMessagePayloadProvider } from '../state/keysignMessagePayload'

export const StartSecureKeysignFlow = ({
  keysignActionProvider: KeysignActionProvider,
}: KeysignActionProviderProp) => {
  const [{ keysignPayload }] = useCoreViewState<'keysign'>()

  return (
    <ValueTransfer<string[]>
      from={({ onFinish }) => (
        <KeysignSignersStep payload={keysignPayload} onFinish={onFinish} />
      )}
      to={({ onBack, value }) => (
        <MpcSignersProvider value={value}>
          <StartMpcSessionFlow
            value="keysign"
            render={() => (
              <KeysignActionProvider>
                <KeysignMessagePayloadProvider value={keysignPayload}>
                  <KeysignSigningStep onBack={onBack} />
                </KeysignMessagePayloadProvider>
              </KeysignActionProvider>
            )}
          />
        </MpcSignersProvider>
      )}
    />
  )
}
