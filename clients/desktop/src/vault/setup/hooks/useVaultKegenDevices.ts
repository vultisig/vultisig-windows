import { useMemo } from 'react'

import { useMpcLocalPartyId } from '../../../mpc/localPartyId/state/mpcLocalPartyId'
import { useSelectedPeers } from '../../keysign/shared/state/selectedPeers'

export const useVaultKeygenDevices = () => {
  const peers = useSelectedPeers()
  const localPartyId = useMpcLocalPartyId()

  return useMemo(() => [localPartyId, ...peers], [localPartyId, peers])
}
