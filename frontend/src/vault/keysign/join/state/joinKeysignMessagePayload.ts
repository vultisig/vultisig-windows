import { useMemo } from 'react';

import { getKeysignMessagePayload } from '../../../../chain/keysign/KeysignMessagePayload';
import { useAppPathState } from '../../../../navigation/hooks/useAppPathState';

export const useJoinKeysignMessagePayload = () => {
  const { keysignMsg } = useAppPathState<'joinKeysign'>();

  return useMemo(() => getKeysignMessagePayload(keysignMsg), [keysignMsg]);
};
