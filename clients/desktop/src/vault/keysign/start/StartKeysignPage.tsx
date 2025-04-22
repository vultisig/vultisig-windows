import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { Match } from '@lib/ui/base/Match'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { StartFastKeysignFlow } from './fast/StartFastKeysignFlow'
import { StartSecureKeysignFlow } from './StartSecureKeysignFlow'

export const StartKeysignPage = () => {
  const { securityType } = useCorePathState<'keysign'>()

  return (
    <StartKeysignProviders>
      <MpcMediatorManager />
      <Match
        value={securityType}
        secure={() => <StartSecureKeysignFlow />}
        fast={() => <StartFastKeysignFlow />}
      />
    </StartKeysignProviders>
  )
}
