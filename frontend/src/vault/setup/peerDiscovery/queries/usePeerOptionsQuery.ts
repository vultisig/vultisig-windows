import { useQuery } from '@tanstack/react-query';

import { usePoll } from '../../../../lib/ui/query/hooks/usePoll';
import { fixedDataQueryOptions } from '../../../../lib/ui/query/utils/options';
import { without } from '../../../../lib/utils/array/without';
import { withoutDuplicates } from '../../../../lib/utils/array/withoutDuplicates';
import { queryUrl } from '../../../../lib/utils/query/queryUrl';
import { keygenServerUrl } from '../../../keygen/KeygenServerType';
import { useCurrentLocalPartyId } from '../../../keygen/state/currentLocalPartyId';
import { useCurrentServerType } from '../../../keygen/state/currentServerType';
import { useCurrentSessionId } from '../../state/currentSessionId';

export const usePeerOptionsQuery = () => {
  const sessionId = useCurrentSessionId();
  const [serverType] = useCurrentServerType();
  const localPartyId = useCurrentLocalPartyId();

  const query = useQuery({
    queryKey: ['peerOptions', sessionId, serverType],
    queryFn: async () => {
      const response = await queryUrl<string[]>(
        `${keygenServerUrl[serverType]}/${sessionId}`
      );

      return without(withoutDuplicates(response), localPartyId);
    },
    ...fixedDataQueryOptions,
  });

  usePoll(query, {
    delay: 5000,
    shouldStop: () => false,
  });

  return query;
};
