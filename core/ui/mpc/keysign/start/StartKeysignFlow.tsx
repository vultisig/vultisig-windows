import { TxResult } from '@core/chain/tx/execute/ExecuteTxResolver'
import { Match } from '@lib/ui/base/Match'
import { OnFinishProp } from '@lib/ui/props'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { KeysignActionProviderProp } from './KeysignActionProviderProp'
import { StartFastKeysignFlow } from './StartFastKeysignFlow'
import { StartSecureKeysignFlow } from './StartSecureKeysignFlow'
import { useRef } from 'react'

export const StartKeysignFlow = ({
  keysignActionProvider,
  onFinish,
}: KeysignActionProviderProp & Partial<OnFinishProp<TxResult>>) => {
  const navigate = useCoreNavigate()
  const [{ securityType }] = useCoreViewState<'keysign'>()
  const hasFinishedRef = useRef(false)
  const handleFinish = (txResult: TxResult) => {
    if (onFinish) {
      onFinish(txResult)
    } else {
      if (!hasFinishedRef.current) {
        hasFinishedRef.current = true
      } else {
        navigate({ id: 'vault' })
      }
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
