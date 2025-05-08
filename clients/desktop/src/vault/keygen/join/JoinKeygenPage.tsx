import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { JoinKeygenProviders } from '@core/ui/mpc/keygen/join/JoinKeygenProviders'
import { JoinMpcSessionFlow } from '@core/ui/mpc/session/join/JoinMpcSessionFlow'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { JoinMpcServerUrlProvider } from '../../../mpc/serverType/JoinMpcServerUrlProvider'
import { JoinKeygenActionProvider } from './JoinKeygenActionProvider'

export const JoinKeygenPage = () => {
  const onExit = useNavigateBack()

  return (
    <JoinKeygenProviders>
      <JoinMpcServerUrlProvider mpcSession="keygen">
        <JoinMpcSessionFlow
          value="keygen"
          render={() => (
            <JoinKeygenActionProvider>
              <KeygenFlow onBack={onExit} />
            </JoinKeygenActionProvider>
          )}
        />
      </JoinMpcServerUrlProvider>
    </JoinKeygenProviders>
  )
}
