import { KeysignActionProvider } from '@core/ui/mpc/keysign/action/KeysignActionProvider'
import { KeysignResultProvider } from '@core/ui/mpc/keysign/result/KeysignResultProvider'
import { StartKeysignFlow } from '@core/ui/mpc/keysign/start/StartKeysignFlow'
import { StartKeysignProviders } from '@core/ui/mpc/keysign/start/StartKeysignProviders'
import { useCore } from '@core/ui/state/core'

export const StartKeysignViewWithResultProvider = () => {
  const { goHome } = useCore()

  return (
    <KeysignResultProvider
      value={{
        onComplete: () => goHome(),
      }}
    >
      <StartKeysignProviders>
        <StartKeysignFlow keysignActionProvider={KeysignActionProvider} />
      </StartKeysignProviders>
    </KeysignResultProvider>
  )
}
