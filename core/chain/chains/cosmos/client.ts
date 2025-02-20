import { CosmosChain } from '@core/chain/Chain'
import { StargateClient } from '@cosmjs/stargate'
import { memoizeAsync } from '@lib/utils/memoizeAsync'

import { tendermintRpcUrl } from './tendermintRpcUrl'

export const getCosmosClient = memoizeAsync(async (chain: CosmosChain) =>
  StargateClient.connect(tendermintRpcUrl[chain])
)
