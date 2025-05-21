import { Match } from '@lib/ui/base/Match'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { KeysignActionProviderProp } from './KeysignActionProviderProp'
import { StartFastKeysignFlow } from './StartFastKeysignFlow'
import { StartSecureKeysignFlow } from './StartSecureKeysignFlow'
import { OnFinishProp } from '@lib/ui/props'

export const StartKeysignFlow = ({
  keysignActionProvider,
  onFinish,
}: KeysignActionProviderProp & Partial<OnFinishProp<string>>) => {
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
