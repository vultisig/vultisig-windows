import { ValueTransfer } from '@lib/ui/base/ValueTransfer'

import { StartMpcSessionFlow } from '../../session/StartMpcSessionFlow'
import { MpcSignersProvider } from '../../state/mpcSigners'
import { KeygenFlow } from '../flow/KeygenFlow'
import { KeygenSignersStep } from '../signers/KeygenSignersStep'

export const ReshareSecureVaultFlow = () => {
  return (
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
  )
}
