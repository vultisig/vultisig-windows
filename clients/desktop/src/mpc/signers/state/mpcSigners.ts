import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMemo } from 'react'

import { useMpcPeers } from '../../peers/state/mpcPeers'

export const useMpcSigners = () => {
  const peers = useMpcPeers()
  const localPartyId = useMpcLocalPartyId()

  return useMemo(() => [localPartyId, ...peers], [localPartyId, peers])
}
