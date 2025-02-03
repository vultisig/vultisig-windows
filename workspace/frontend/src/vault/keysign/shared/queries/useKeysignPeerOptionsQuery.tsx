import { useCallback } from 'react';

import { useTransformQueryData } from '../../../../lib/ui/query/hooks/useTransformQueryData';
import { intersection } from '@lib/utils/array/intersection';
import { usePeerOptionsQuery } from '../../../keygen/shared/peerDiscovery/queries/usePeerOptionsQuery';
import { useCurrentVault } from '../../../state/currentVault';

export const useKeysignPeerOptionsQuery = () => {
  const { signers } = useCurrentVault();

  return useTransformQueryData(
    usePeerOptionsQuery(),
    useCallback(options => intersection(options, signers), [signers])
  );
};
