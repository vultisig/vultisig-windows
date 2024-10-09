import { useMemo } from 'react';

import { useCurrentLocalPartyId } from '../../keygen/state/currentLocalPartyId';
import { useCurrentPeers } from '../../keysign/shared/state/currentPeers';

export const useVaultKeygenDevices = () => {
  const [peers] = useCurrentPeers();
  const localPartyId = useCurrentLocalPartyId();

  return useMemo(() => [localPartyId, ...peers], [localPartyId, peers]);
};
