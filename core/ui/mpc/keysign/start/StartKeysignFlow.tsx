import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { Match } from '@lib/ui/base/Match'

import { KeysignActionProviderProp } from './KeysignActionProviderProp'
import { StartFastKeysignFlow } from './StartFastKeysignFlow'
import { StartSecureKeysignFlow } from './StartSecureKeysignFlow'

export const StartKeysignFlow = ({
  keysignActionProvider,
}: KeysignActionProviderProp) => {
  const { securityType } = useCorePathState<'keysign'>()

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
