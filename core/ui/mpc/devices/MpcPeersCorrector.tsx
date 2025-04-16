import { useMpcPeersSelectionRecord } from '@core/ui/mpc/state/mpcSelectedPeers'
import { omit } from '@lib/utils/record/omit'
import { useEffect } from 'react'

import { useMpcPeerOptionsQuery } from './queries/useMpcPeerOptionsQuery'

export const MpcPeersCorrector = () => {
  const [value, setValue] = useMpcPeersSelectionRecord()

  const peerOptionsQuery = useMpcPeerOptionsQuery()

  useEffect(() => {
    const options = peerOptionsQuery.data ?? []

    let newValue = value

    ;[...Object.keys(newValue), ...options].forEach(peer => {
      if (!options.includes(peer)) {
        newValue = omit(newValue, peer)
      } else if (!(peer in newValue)) {
        newValue = { ...newValue, [peer]: true }
      }
    })

    if (newValue !== value) {
      setValue(newValue)
    }
  }, [peerOptionsQuery.data, setValue, value])

  return null
}
