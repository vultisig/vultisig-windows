import { useQuery } from '@tanstack/react-query';

import { DiscoveryService } from '../../../../../wailsjs/go/mediator/Server';
import { Endpoint } from '../../../../services/Endpoint';
import { KeygenServerType } from '../../KeygenServerType';

type UseServerUrlQueryInput = {
  serverType: KeygenServerType;
  serviceName: string;
  sessionId: string;
};

export const useServerUrlQuery = ({
  serverType,
  serviceName,
  sessionId,
}: UseServerUrlQueryInput) => {
  return useQuery({
    queryKey: ['serverUrl', serviceName, sessionId],
    queryFn: () => {
      if (serverType === 'relay') {
        return Endpoint.VULTISIG_RELAY;
      }

      return DiscoveryService(serviceName);
    },
  });
};
