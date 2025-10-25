import { CreateVaultNameStep } from '@core/ui/mpc/keygen/create/CreateVaultNameStep'
import { KeygenFlow } from '@core/ui/mpc/keygen/flow/KeygenFlow'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { StartMpcSessionFlow } from '../../../session/StartMpcSessionFlow'
import { MpcSignersProvider } from '../../../state/mpcSigners'
import { KeygenSignersStep } from '../../signers/KeygenSignersStep'

export const CreateSecureVaultFlow = () => {
  return (
    <StepTransition
      from={({ onFinish }) => <CreateVaultNameStep onFinish={onFinish} />}
      to={({ onBack }) => (
        <ValueTransfer<string[]>
          from={({ onFinish }) => (
            <KeygenSignersStep onBack={onBack} onFinish={onFinish} />
          )}
          to={({ value }) => (
            <MpcSignersProvider value={value}>
              <StartMpcSessionFlow
                value="keygen"
                render={() => <KeygenFlow onBack={onBack} />}
              />
            </MpcSignersProvider>
          )}
        />
      )}
    />
  )
}
