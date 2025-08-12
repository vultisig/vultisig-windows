import { CosmosChain } from '@core/chain/Chain'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { getCosmosWasmTokenBalanceUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { getDenom } from '@core/chain/coin/utils/getDenom'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { CoinBalanceResolver } from '../resolver'

const isWasmToken = (id: string): boolean => {
  if (id.startsWith('ibc/') || id.startsWith('factory/')) {
    return false
  }

  const wasmTokenPattern = /^[a-z]+1[a-z0-9]{20,80}$/

  return wasmTokenPattern.test(id)
}

export const getCosmosCoinBalance: CoinBalanceResolver<
  CosmosChain
> = async input => {
  if (input.id && isWasmToken(input.id)) {
    const url = getCosmosWasmTokenBalanceUrl(input)
    const { data } = await queryUrl<WasmQueryResponse>(url)
    return BigInt(data.balance ?? 0)
  }

  const client = await getCosmosClient(input.chain)

  const denom = getDenom(input)

  const balance = await client.getBalance(input.address, denom)

  return BigInt(balance.amount)
}

type WasmQueryResponse = {
  data: {
    balance: string
  }
}
