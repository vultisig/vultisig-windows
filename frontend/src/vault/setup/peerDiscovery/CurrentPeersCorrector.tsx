import { useEffect } from 'react';

import { intersection } from '../../../lib/utils/array/intersection';
import { useCurrentPeers } from '../state/currentPeers';
import { usePeerOptionsQuery } from './queries/usePeerOptionsQuery';

export const CurrentPeersCorrector = () => {
  const [value, setValue] = useCurrentPeers();

  const peerOptionsQuery = usePeerOptionsQuery();

  useEffect(() => {
    const options = peerOptionsQuery.data;
    if (!options) return;

    const filteredPeers = intersection(value, options);
    if (filteredPeers.length !== value.length) {
      setValue(filteredPeers);
    }
  }, [peerOptionsQuery.data, setValue, value]);

  return null;
};
