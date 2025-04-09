import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcPeers } from '@core/ui/mpc/state/mpcPeers'
import { useMemo } from 'react'

export const useMpcSigners = () => {
  const peers = useMpcPeers()
  const localPartyId = useMpcLocalPartyId()

  return useMemo(() => [localPartyId, ...peers], [localPartyId, peers])
}
