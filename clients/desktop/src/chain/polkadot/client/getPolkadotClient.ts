import { memoizeAsync } from '@lib/utils/memoizeAsync';
import { ApiPromise, HttpProvider } from '@polkadot/api';

import { Endpoint } from '../../../services/Endpoint';

export const getPolkadotClient = memoizeAsync(() => {
  const provider = new HttpProvider(Endpoint.polkadotServiceRpc);
  return ApiPromise.create({ provider });
});
