import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { KeygenPeerDiscoveryStep } from '@core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { CurrentKeygenOperationTypeProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { StepTransition } from '@lib/ui/base/StepTransition'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { MigrateVaultKeygenActionProvider } from '../../migrate/MigrateVaultKeygenActionProvider'

export const SecureMigrateVaultPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <CurrentKeygenOperationTypeProvider
        value={{ operation: 'reshare', type: 'migrate' }}
      >
        <MigrateVaultKeygenActionProvider>
          <MpcMediatorManager />
          <StepTransition
            from={({ onFinish }) => (
              <KeygenPeerDiscoveryStep onFinish={onFinish} />
            )}
            to={({ onBack }) => (
              <StartMpcSessionFlow
                value="keygen"
                render={() => <KeygenFlow onBack={onBack} />}
              />
            )}
          />
        </MigrateVaultKeygenActionProvider>
      </CurrentKeygenOperationTypeProvider>
    </ReshareVaultFlowProviders>
  )
}
