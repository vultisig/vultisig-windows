import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { RenderProp, ValueProp } from '@lib/ui/props'

import { MpcSignersProvider } from '../devices/state/signers'
import { MpcSession } from './MpcSession'
import { StartMpcSessionStep } from './StartMpcSessionStep'

export const StartMpcSessionFlow = ({
  hidden,
  render,
  value,
}: RenderProp & ValueProp<MpcSession> & { hidden?: boolean }) => {
  return (
    <ValueTransfer<string[]>
      from={({ onFinish }) => (
        <StartMpcSessionStep hidden={hidden} onFinish={onFinish} value={value} />
      )}
      to={({ value }) => (
        <MpcSignersProvider value={value}>{render()}</MpcSignersProvider>
      )}
    />
  )
}
