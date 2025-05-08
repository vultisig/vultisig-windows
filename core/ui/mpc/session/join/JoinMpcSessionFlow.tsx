import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { RenderProp, ValueProp } from '@lib/ui/props'

import { MpcPeersProvider } from '../../state/mpcPeers'
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
            <MpcPeersProvider value={value}>{render()}</MpcPeersProvider>
          )}
        />
      )}
    />
  )
}
