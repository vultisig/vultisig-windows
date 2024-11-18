import { useQuery } from '@tanstack/react-query';

import { pollingQueryOptions } from '../../../../../lib/ui/query/utils/options';
import { intersection } from '../../../../../lib/utils/array/intersection';
import { without } from '../../../../../lib/utils/array/without';
import { withoutDuplicates } from '../../../../../lib/utils/array/withoutDuplicates';
import { queryUrl } from '../../../../../lib/utils/query/queryUrl';
import { useCurrentVault } from '../../../../state/currentVault';
import { useCurrentLocalPartyId } from '../../../state/currentLocalPartyId';
import { useCurrentServerUrl } from '../../../state/currentServerUrl';
import { useCurrentSessionId } from '../../state/currentSessionId';

export const usePeerOptionsQuery = () => {
  const sessionId = useCurrentSessionId();
  const localPartyId = useCurrentLocalPartyId();
  const serverUrl = useCurrentServerUrl();
  const { signers } = useCurrentVault();

  return useQuery({
    queryKey: ['peerOptions', sessionId, serverUrl],
    queryFn: async () => {
      const response = await queryUrl<string[]>(`${serverUrl}/${sessionId}`);

      return intersection(
        without(withoutDuplicates(response), localPartyId),
        signers
      );
    },
    ...pollingQueryOptions(2000),
  });
};
