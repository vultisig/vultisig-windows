import { isEmpty } from '@lib/utils/array/isEmpty'
import { recordFromKeys } from '@lib/utils/record/recordFromKeys'
import { useEffect, useMemo } from 'react'

import { OnBackProp, OnForwardProp } from '../../../lib/ui/props'
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery'
import { usePeerOptionsQuery } from '../../keygen/shared/peerDiscovery/queries/usePeerOptionsQuery'
import { usePeersSelectionRecord } from '../../keysign/shared/state/selectedPeers'
import { WaitForServerStates } from './WaitForServerStates'

export const WaitForServerToJoinStep: React.FC<
  OnForwardProp & Partial<OnBackProp>
> = ({ onForward }) => {
  const peerOptionsQuery = usePeerOptionsQuery()
  const [, setRecord] = usePeersSelectionRecord()

  // @antonio: the query is automatically polling when there are no peers yet. We want the query to be still in pending state during that time.
  const processedQuery = useMemo(
    () => ({
      ...peerOptionsQuery,
      isPending:
        peerOptionsQuery.data?.length === 0 || peerOptionsQuery.isPending,
      data:
        peerOptionsQuery.data?.length === 0 || !peerOptionsQuery.data
          ? undefined
          : peerOptionsQuery.data,
    }),
    [peerOptionsQuery]
  )

  const { data } = processedQuery

  useEffect(() => {
    if (data && !isEmpty(data)) {
      setRecord(recordFromKeys(data, () => true))
    }
  }, [data, setRecord])

  return (
    <>
      <MatchQuery
        value={processedQuery}
        pending={() => <WaitForServerStates state="pending" />}
        success={() => (
          <WaitForServerStates state="success" onAnimationEnd={onForward} />
        )}
        error={() => (
          <WaitForServerStates state="error" onAnimationEnd={onForward} />
        )}
      />
    </>
  )
}
