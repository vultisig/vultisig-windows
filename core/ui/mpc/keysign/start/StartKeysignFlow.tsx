import { TxResult } from '@core/chain/tx/execute/ExecuteTxResolver'
import { Match } from '@lib/ui/base/Match'
import { OnFinishProp } from '@lib/ui/props'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { KeysignActionProviderProp } from './KeysignActionProviderProp'
import { StartFastKeysignFlow } from './StartFastKeysignFlow'
import { StartSecureKeysignFlow } from './StartSecureKeysignFlow'

export const StartKeysignFlow = ({
  keysignActionProvider,
  onFinish,
}: KeysignActionProviderProp & Partial<OnFinishProp<TxResult>>) => {
  const [{ securityType }] = useCoreViewState<'keysign'>()

  return (
    <Match
      value={securityType}
      secure={() => (
        <StartSecureKeysignFlow
          keysignActionProvider={keysignActionProvider}
          onFinish={onFinish}
        />
      )}
      fast={() => (
        <StartFastKeysignFlow
          keysignActionProvider={keysignActionProvider}
          onFinish={onFinish}
        />
      )}
    />
  )
}
