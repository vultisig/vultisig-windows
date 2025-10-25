import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { RenderProp, ValueProp } from '@lib/ui/props'

import { MpcSignersProvider } from '../../state/mpcSigners'
import { MpcSession } from '../MpcSession'
import { WaitMpcSessionStart } from '../WaitMpcSessionStart'
import { JoinMpcSessionStep } from './JoinMpcSessionStep'

export const JoinMpcSessionFlow = ({
  render,
  value,
}: RenderProp & ValueProp<MpcSession>) => {
  return (
    <StepTransition
      from={({ onFinish }) => <JoinMpcSessionStep onFinish={onFinish} />}
      to={() => (
        <ValueTransfer<string[]>
          from={({ onFinish }) => (
            <WaitMpcSessionStart value={value} onFinish={onFinish} />
          )}
          to={({ value }) => (
            <MpcSignersProvider value={value}>{render()}</MpcSignersProvider>
          )}
        />
      )}
    />
  )
}
