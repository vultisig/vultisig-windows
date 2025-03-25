import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'

import { usePeerOptionsQuery } from '../../keygen/shared/peerDiscovery/queries/usePeerOptionsQuery'
import { WaitForServerStates } from './WaitForServerStates'

export const WaitForServerToJoinStep: React.FC<
  OnFinishProp<string[]> & Partial<OnBackProp>
> = ({ onFinish }) => {
  const peersQuery = usePeerOptionsQuery()

  return (
    <>
      <MatchQuery
        value={peersQuery}
        pending={() => <WaitForServerStates state="pending" />}
        success={data => (
          <WaitForServerStates
            state="success"
            onAnimationEnd={() => {
              onFinish(data)
            }}
          />
        )}
        error={() => <WaitForServerStates state="error" />}
      />
    </>
  )
}
