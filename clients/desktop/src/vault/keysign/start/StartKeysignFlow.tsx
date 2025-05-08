import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { Match } from '@lib/ui/base/Match'

import { StartFastKeysignFlow } from './fast/StartFastKeysignFlow'
import { StartSecureKeysignFlow } from './StartSecureKeysignFlow'

export const StartKeysignFlow = () => {
  const { securityType } = useCorePathState<'keysign'>()

  return (
    <Match
      value={securityType}
      secure={() => <StartSecureKeysignFlow />}
      fast={() => <StartFastKeysignFlow />}
    />
  )
}
