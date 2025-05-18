import { StepTransition } from '@lib/ui/base/StepTransition'
import { OnBackProp } from '@lib/ui/props'

import { StartMpcSessionFlow } from '../../session/StartMpcSessionFlow'
import { KeygenFlow } from '../flow/KeygenFlow'
import { useCurrentKeygenType } from '../state/currentKeygenType'
import { ReshareVerifyStep } from './verify/ReshareVerifyStep'

export const ReshareKeygenFlow = ({ onBack }: OnBackProp) => {
  const keygenType = useCurrentKeygenType()

  if (keygenType === 'migrate') {
    return (
      <StartMpcSessionFlow
        value="keygen"
        render={() => <KeygenFlow onBack={onBack} />}
      />
    )
  }

  return (
    <StepTransition
      from={({ onFinish }) => (
        <ReshareVerifyStep onBack={onBack} onFinish={onFinish} />
      )}
      to={({ onBack }) => (
        <StartMpcSessionFlow
          value="keygen"
          render={() => <KeygenFlow onBack={onBack} />}
        />
      )}
    />
  )
}
