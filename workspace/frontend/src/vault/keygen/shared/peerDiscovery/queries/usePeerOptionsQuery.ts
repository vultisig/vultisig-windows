import { without } from '@lib/utils/array/without';
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates';
import { queryUrl } from '@lib/utils/query/queryUrl';
import { useQuery } from '@tanstack/react-query';

import { pollingQueryOptions } from '../../../../../lib/ui/query/utils/options';
import { useCurrentLocalPartyId } from '../../../state/currentLocalPartyId';
import { useCurrentServerUrl } from '../../../state/currentServerUrl';
import { useCurrentSessionId } from '../../state/currentSessionId';

export const usePeerOptionsQuery = ({ enabled = true } = {}) => {
  const sessionId = useCurrentSessionId();
  const localPartyId = useCurrentLocalPartyId();
  const serverUrl = useCurrentServerUrl();

  return useQuery({
    queryKey: ['peerOptions', sessionId, serverUrl],
    queryFn: async () => {
      const response = await queryUrl<string[]>(`${serverUrl}/${sessionId}`);

      return without(withoutDuplicates(response), localPartyId);
    },
    enabled,
    ...pollingQueryOptions(2000),
  });
};
