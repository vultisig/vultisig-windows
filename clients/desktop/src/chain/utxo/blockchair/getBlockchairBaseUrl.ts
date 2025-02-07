import { rootApiUrl } from '@core/config';

import { UtxoChain } from '../../../model/chain';

export const getBlockchairBaseUrl = (chain: UtxoChain) =>
  `${rootApiUrl}/blockchair/${chain.toLowerCase()}`;
