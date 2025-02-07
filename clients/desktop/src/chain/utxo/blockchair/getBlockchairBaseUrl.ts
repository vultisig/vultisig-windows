import { rootApiUrl } from '@core/config';

import { UtxoChain } from '@core/chain/Chain';

export const getBlockchairBaseUrl = (chain: UtxoChain) =>
  `${rootApiUrl}/blockchair/${chain.toLowerCase()}`;
