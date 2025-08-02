import { CosmosChain } from '@core/chain/Chain'

import { getCosmosClient } from '../../../cosmos/client'
import { rujiraStakingConfig } from '../../../cosmos/thor/rujira/config'

export async function fetchLiquidRUJI(addr: string): Promise<string> {
  const c = await getCosmosClient(CosmosChain.THORChain)
  const coins = await c.getAllBalances(addr)
  const ruji = coins.find(
    x => x.denom.toLowerCase() === rujiraStakingConfig.bondDenom.toLowerCase()
  )
  return ruji?.amount ?? '0'
}
