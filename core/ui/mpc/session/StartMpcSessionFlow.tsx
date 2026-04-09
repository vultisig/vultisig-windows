import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { RenderProp, ValueProp } from '@lib/ui/props'
import { ReactNode } from 'react'

import { MpcSignersProvider } from '../devices/state/signers'
import { MpcSession } from './MpcSession'
import { StartMpcSessionStep } from './StartMpcSessionStep'

type StartMpcSessionFlowProps = RenderProp &
  ValueProp<MpcSession> & {
    renderPending?: () => ReactNode
  }

export const StartMpcSessionFlow = ({
  render,
  value,
  renderPending,
}: StartMpcSessionFlowProps) => {
  return (
    <ValueTransfer<string[]>
      from={({ onFinish }) => (
        <StartMpcSessionStep
          onFinish={onFinish}
          value={value}
          renderPending={renderPending}
        />
      )}
      to={({ value }) => (
        <MpcSignersProvider value={value}>{render()}</MpcSignersProvider>
      )}
    />
  )
}
