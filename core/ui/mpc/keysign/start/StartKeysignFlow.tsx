import { Match } from '@lib/ui/base/Match'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { KeysignActionProviderProp } from './KeysignActionProviderProp'
import { StartFastKeysignFlow } from './StartFastKeysignFlow'
import { StartSecureKeysignFlow } from './StartSecureKeysignFlow'

export const StartKeysignFlow = ({
  keysignActionProvider,
}: KeysignActionProviderProp) => {
  const [{ securityType }] = useCoreViewState<'keysign'>()

  return (
    <Match
      value={securityType}
      secure={() => (
        <StartSecureKeysignFlow keysignActionProvider={keysignActionProvider} />
      )}
      fast={() => (
        <StartFastKeysignFlow keysignActionProvider={keysignActionProvider} />
      )}
    />
  )
}
