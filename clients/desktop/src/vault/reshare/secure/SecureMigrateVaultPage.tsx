import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { ReshareVaultFlowProviders } from '@core/ui/mpc/keygen/reshare/ReshareVaultFlowProviders'
import { KeygenSignersStep } from '@core/ui/mpc/keygen/signers/KeygenSignersStep'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { StartMpcSessionFlow } from '@core/ui/mpc/session/StartMpcSessionFlow'
import { MpcSignersProvider } from '@core/ui/mpc/state/mpcSigners'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { MigrateVaultKeygenActionProvider } from '../../migrate/MigrateVaultKeygenActionProvider'

export const SecureMigrateVaultPage = () => {
  return (
    <ReshareVaultFlowProviders>
      <KeygenOperationProvider value={{ reshare: 'migrate' }}>
        <MigrateVaultKeygenActionProvider>
          <MpcMediatorManager />
          <ValueTransfer<string[]>
            from={({ onFinish }) => <KeygenSignersStep onFinish={onFinish} />}
            to={({ onBack, value }) => (
              <MpcSignersProvider value={value}>
                <StartMpcSessionFlow
                  value="keygen"
                  render={() => <KeygenFlow onBack={onBack} />}
                />
              </MpcSignersProvider>
            )}
          />
        </MigrateVaultKeygenActionProvider>
      </KeygenOperationProvider>
    </ReshareVaultFlowProviders>
  )
}
