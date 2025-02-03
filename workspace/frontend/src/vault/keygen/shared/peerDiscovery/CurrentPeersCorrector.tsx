import { useEffect } from 'react';

import { omit } from '@lib/utils/record/omit';
import { usePeersSelectionRecord } from '../../../keysign/shared/state/selectedPeers';
import { usePeerOptionsQuery } from './queries/usePeerOptionsQuery';

export const CurrentPeersCorrector = () => {
  const [value, setValue] = usePeersSelectionRecord();

  const peerOptionsQuery = usePeerOptionsQuery();

  useEffect(() => {
    const options = peerOptionsQuery.data ?? [];

    let newValue = value;

    [...Object.keys(newValue), ...options].forEach(peer => {
      if (!options.includes(peer)) {
        newValue = omit(newValue, peer);
      } else if (!(peer in newValue)) {
        newValue = { ...newValue, [peer]: true };
      }
    });

    if (newValue !== value) {
      setValue(newValue);
    }
  }, [peerOptionsQuery.data, setValue, value]);

  return null;
};
