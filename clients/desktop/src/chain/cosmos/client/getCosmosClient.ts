import { StargateClient } from '@cosmjs/stargate';
import { memoizeAsync } from '@lib/utils/memoizeAsync';

import { CosmosChain } from '@core/chain/Chain';
import { cosmosTendermintRpcUrl } from '../cosmosTendermintRpcUrl';

export const getCosmosClient = memoizeAsync(async (chain: CosmosChain) =>
  StargateClient.connect(cosmosTendermintRpcUrl[chain])
);
