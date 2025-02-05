import { ApiPromise, HttpProvider } from '@polkadot/api';

import { Endpoint } from '../../../services/Endpoint';

export const getPolkadotApiClient = () => {
  const provider = new HttpProvider(Endpoint.polkadotServiceRpc);
  return ApiPromise.create({ provider });
};
