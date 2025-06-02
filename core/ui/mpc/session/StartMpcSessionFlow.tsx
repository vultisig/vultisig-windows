import { KeygenType } from '@core/mpc/keygen/KeygenType'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { RenderProp, ValueProp } from '@lib/ui/props'

import { MpcSession } from './MpcSession'
import { StartMpcSessionStep } from './StartMpcSessionStep'

export const StartMpcSessionFlow = ({
  render,
  value,
  keygenType,
}: RenderProp &
  ValueProp<MpcSession> &
  Partial<{ keygenType: KeygenType }>) => {
  return (
    <StepTransition
      from={({ onFinish }) => (
        <StartMpcSessionStep
          onFinish={onFinish}
          value={value}
          keygenType={keygenType}
        />
      )}
      to={() => render()}
    />
  )
}
