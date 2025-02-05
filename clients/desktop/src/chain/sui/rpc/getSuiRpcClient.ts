import { memoize } from '@lib/utils/memoize';
import { SuiClient } from '@mysten/sui/client';

import { Endpoint } from '../../../services/Endpoint';

export const getSuiRpcClient = memoize(
  () => new SuiClient({ url: Endpoint.suiServiceRpc })
);
