import { mpcServerUrl } from '@core/mpc/MpcServerType'
import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { JoinKeygenProviders } from '@core/ui/mpc/keygen/join/JoinKeygenProviders'
import { JoinMpcSessionFlow } from '@core/ui/mpc/session/join/JoinMpcSessionFlow'
import { MpcServerUrlProvider } from '@core/ui/mpc/state/mpcServerUrl'
import { useCore } from '@core/ui/state/core'

import { JoinKeygenActionProvider } from './JoinKeygenActionProvider'

export const JoinKeygenPage = () => {
  const { goBack } = useCore()

  return (
    <JoinKeygenProviders>
      <MpcServerUrlProvider value={mpcServerUrl.relay}>
        <JoinMpcSessionFlow
          value="keygen"
          render={() => (
            <JoinKeygenActionProvider>
              <KeygenFlow onBack={goBack} />
            </JoinKeygenActionProvider>
          )}
        />
      </MpcServerUrlProvider>
    </JoinKeygenProviders>
  )
}
