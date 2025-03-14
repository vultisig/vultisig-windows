import { isEmpty } from '@lib/utils/array/isEmpty'
import { recordFromKeys } from '@lib/utils/record/recordFromKeys'
import { useEffect } from 'react'

import { useMpcPeersSelectionRecord } from '../../../../mpc/peers/state/mpcSelectedPeers'
import { usePeerOptionsQuery } from '../../../keygen/shared/peerDiscovery/queries/usePeerOptionsQuery'

export const useVaultPeersSetup = (enabled: boolean) => {
  const peerOptionsQuery = usePeerOptionsQuery({
    enabled: enabled,
  })

  const [peers, setPeers] = useMpcPeersSelectionRecord()
  const numberOfPeers = Object.values(peers).length

  useEffect(() => {
    if (enabled && peerOptionsQuery.data && !isEmpty(peerOptionsQuery.data)) {
      setPeers(recordFromKeys(peerOptionsQuery.data, () => true))
    }
  }, [enabled, peerOptionsQuery.data, setPeers])

  return {
    isPending: !enabled || numberOfPeers === 0 || peerOptionsQuery.isPending,
    error: peerOptionsQuery.error,
    hasPeers: numberOfPeers > 0,
  }
}
