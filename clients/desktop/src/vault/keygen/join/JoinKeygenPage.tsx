import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { JoinKeygenProviders } from '@core/ui/mpc/keygen/join/JoinKeygenProviders'
import { JoinMpcSessionFlow } from '@core/ui/mpc/session/join/JoinMpcSessionFlow'
import { useCore } from '@core/ui/state/core'

import { JoinMpcServerUrlProvider } from '../../../mpc/serverType/JoinMpcServerUrlProvider'
import { JoinKeygenActionProvider } from './JoinKeygenActionProvider'

export const JoinKeygenPage = () => {
  const { goBack } = useCore()

  return (
    <JoinKeygenProviders>
      <JoinMpcServerUrlProvider mpcSession="keygen">
        <JoinMpcSessionFlow
          value="keygen"
          render={() => (
            <JoinKeygenActionProvider>
              <KeygenFlow onBack={goBack} />
            </JoinKeygenActionProvider>
          )}
        />
      </JoinMpcServerUrlProvider>
    </JoinKeygenProviders>
  )
}
