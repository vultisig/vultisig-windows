import { KeysignActionProvider } from '@core/ui/mpc/keysign/action/KeysignActionProvider'
import { StartKeysignFlow } from '@core/ui/mpc/keysign/start/StartKeysignFlow'
import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'

export const StartKeysignPage = () => {
  return (
    <StartKeysignProviders>
      <StartKeysignFlow keysignActionProvider={KeysignActionProvider} />
    </StartKeysignProviders>
  )
}
