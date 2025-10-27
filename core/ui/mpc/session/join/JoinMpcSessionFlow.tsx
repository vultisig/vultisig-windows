import { StepTransition } from '@lib/ui/base/StepTransition'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { RenderProp, ValueProp } from '@lib/ui/props'
import { without } from '@lib/utils/array/without'

import { MpcSignersProvider } from '../../devices/state/signers'
import { useMpcLocalPartyId } from '../../state/mpcLocalPartyId'
import { MpcPeersProvider } from '../../state/mpcPeers'
import { MpcSession } from '../MpcSession'
import { WaitMpcSessionStart } from '../WaitMpcSessionStart'
import { JoinMpcSessionStep } from './JoinMpcSessionStep'

export const JoinMpcSessionFlow = ({
  render,
  value,
}: RenderProp & ValueProp<MpcSession>) => {
  const localPartyId = useMpcLocalPartyId()

  return (
    <StepTransition
      from={({ onFinish }) => <JoinMpcSessionStep onFinish={onFinish} />}
      to={() => (
        <ValueTransfer<string[]>
          from={({ onFinish }) => (
            <WaitMpcSessionStart value={value} onFinish={onFinish} />
          )}
          to={({ value }) => (
            <MpcSignersProvider value={value}>
              <MpcPeersProvider value={without(value, localPartyId)}>
                {render()}
              </MpcPeersProvider>
            </MpcSignersProvider>
          )}
        />
      )}
    />
  )
}
