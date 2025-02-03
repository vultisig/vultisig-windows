import { useMemo } from 'react';

import { useCurrentLocalPartyId } from '../../keygen/state/currentLocalPartyId';
import { useSelectedPeers } from '../../keysign/shared/state/selectedPeers';

export const useVaultKeygenDevices = () => {
  const peers = useSelectedPeers();
  const localPartyId = useCurrentLocalPartyId();

  return useMemo(() => [localPartyId, ...peers], [localPartyId, peers]);
};
