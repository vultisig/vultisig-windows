import { omit } from '@lib/utils/record/omit'
import { useEffect } from 'react'

import { useMpcPeersSelectionRecord } from '../../../../mpc/peers/state/mpcSelectedPeers'
import { usePeerOptionsQuery } from './queries/usePeerOptionsQuery'

export const CurrentPeersCorrector = () => {
  const [value, setValue] = useMpcPeersSelectionRecord()

  const peerOptionsQuery = usePeerOptionsQuery()

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
