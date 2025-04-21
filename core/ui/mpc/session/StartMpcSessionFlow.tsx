import { StepTransition } from '@lib/ui/base/StepTransition'
import { RenderProp } from '@lib/ui/props'

import { StartMpcSessionStep } from './StartMpcSessionStep'

export const StartMpcSessionFlow = ({ render }: RenderProp) => {
  return (
    <StepTransition
      from={({ onFinish }) => <StartMpcSessionStep onFinish={onFinish} />}
      to={() => render()}
    />
  )
}
