import { StepTransition } from '@lib/ui/base/StepTransition'
import { RenderProp, ValueProp } from '@lib/ui/props'

import { MpcSession } from './MpcSession'
import { StartMpcSessionStep } from './StartMpcSessionStep'

export const StartMpcSessionFlow = ({
  render,
  value,
}: RenderProp & ValueProp<MpcSession>) => {
  return (
    <StepTransition
      from={({ onFinish }) => (
        <StartMpcSessionStep onFinish={onFinish} value={value} />
      )}
      to={() => render()}
    />
  )
}
