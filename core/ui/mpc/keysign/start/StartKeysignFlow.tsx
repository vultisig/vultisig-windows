import { TxResult } from '@core/chain/tx/execute/ExecuteTxResolver'
import { Match } from '@lib/ui/base/Match'
import { OnFinishProp } from '@lib/ui/props'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { KeysignActionProviderProp } from './KeysignActionProviderProp'
import { StartFastKeysignFlow } from './StartFastKeysignFlow'
import { StartSecureKeysignFlow } from './StartSecureKeysignFlow'

export const StartKeysignFlow = ({
  keysignActionProvider,
  onFinish,
}: KeysignActionProviderProp & Partial<OnFinishProp<TxResult>>) => {
  const navigate = useCoreNavigate()
  const [{ securityType }] = useCoreViewState<'keysign'>()

  const handleFinish = (txResult: TxResult) => {
    if (onFinish) {
      onFinish(txResult)
    } else {
      navigate({ id: 'vault' })
    }
  }

  return (
    <Match
      value={securityType}
      secure={() => (
        <StartSecureKeysignFlow
          keysignActionProvider={keysignActionProvider}
          onFinish={handleFinish}
        />
      )}
      fast={() => (
        <StartFastKeysignFlow
          keysignActionProvider={keysignActionProvider}
          onFinish={handleFinish}
        />
      )}
    />
  )
}
