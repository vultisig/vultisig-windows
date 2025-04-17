import { useMpcPeerOptionsQuery } from '@core/ui/mpc/devices/queries/useMpcPeerOptionsQuery'
import { useMpcPeersSelectionRecord } from '@core/ui/mpc/state/mpcSelectedPeers'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { recordFromKeys } from '@lib/utils/record/recordFromKeys'
import { useEffect } from 'react'

export const useVaultPeersSetup = (enabled: boolean) => {
  const peerOptionsQuery = useMpcPeerOptionsQuery({
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
