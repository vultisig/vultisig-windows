import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { JoinKeygenProviders } from '@core/ui/mpc/keygen/join/JoinKeygenProviders'
import { JoinMpcSessionFlow } from '@core/ui/mpc/session/join/JoinMpcSessionFlow'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { JoinKeygenActionProvider } from './JoinKeygenActionProvider'
import { JoinKeygenServerUrlProvider } from './JoinKeygenServerUrlProvider'

export const JoinKeygenPage = () => {
  const onExit = useNavigateBack()

  return (
    <JoinKeygenProviders>
      <JoinKeygenServerUrlProvider>
        <MpcMediatorManager />
        <JoinMpcSessionFlow
          render={() => (
            <JoinKeygenActionProvider>
              <KeygenFlow onBack={onExit} />
            </JoinKeygenActionProvider>
          )}
        />
      </JoinKeygenServerUrlProvider>
    </JoinKeygenProviders>
  )
}
