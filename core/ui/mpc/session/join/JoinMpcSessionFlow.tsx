import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { ReactNode } from 'react'

import { MpcPeersProvider } from '../../state/mpcPeers'
import { WaitMpcSessionStart } from '../WaitMpcSessionStart'
import { JoinMpcSessionStep } from './JoinMpcSessionStep'

type JoinMpcSessionFlowProps = {
  render: () => ReactNode
}

export const JoinMpcSessionFlow = ({ render }: JoinMpcSessionFlowProps) => {
  return (
    <StepTransition
      from={({ onFinish }) => <JoinMpcSessionStep onFinish={onFinish} />}
      to={() => (
        <ValueTransfer<string[]>
          from={({ onFinish }) => (
            <WaitMpcSessionStart value="keygen" onFinish={onFinish} />
          )}
          to={({ value }) => (
            <MpcPeersProvider value={value}>{render()}</MpcPeersProvider>
          )}
        />
      )}
    />
  )
}
