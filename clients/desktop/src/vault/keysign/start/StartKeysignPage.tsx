import { StartKeysignFlow } from '@core/ui/mpc/keysign/start/StartKeysignFlow'
import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { KeysignActionProvider } from '../action/KeysignActionProvider'

export const StartKeysignPage = () => {
  return (
    <StartKeysignProviders>
      <MpcMediatorManager />
      <StartKeysignFlow keysignActionProvider={KeysignActionProvider} />
    </StartKeysignProviders>
  )
}
