import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { Match } from '@lib/ui/base/Match'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { StartFastKeysignFlow } from './fast/StartFastKeysignFlow'
import { StartSecureKeysignFlow } from './StartSecureKeysignFlow'

export const StartKeysignPage = () => {
  const [{ securityType }] = useCoreViewState<'keysign'>()

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
