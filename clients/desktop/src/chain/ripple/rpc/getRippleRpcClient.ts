import { memoizeAsync } from '@lib/utils/memoizeAsync';
import { Client } from 'xrpl';

import { Endpoint } from '../../../services/Endpoint';

export const getRippleRpcClient = memoizeAsync(async () => {
  const client = new Client(Endpoint.rippleServiceRpc);
  await client.connect();

  return client;
});
