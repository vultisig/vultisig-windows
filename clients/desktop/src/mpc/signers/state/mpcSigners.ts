import { useMemo } from 'react'

import { useMpcLocalPartyId } from '../../../mpc/localPartyId/state/mpcLocalPartyId'
import { useMpcPeers } from '../../peers/state/mpcPeers'

export const useMpcSigners = () => {
  const peers = useMpcPeers()
  const localPartyId = useMpcLocalPartyId()

  return useMemo(() => [localPartyId, ...peers], [localPartyId, peers])
}
