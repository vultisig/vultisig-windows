import { CosmosChain } from '@core/chain/Chain'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import {
  cosmosRpcUrl,
  getCosmosWasmTokenBalanceUrl,
} from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { restOnlyChains } from '@core/chain/chains/cosmos/restOnlyChains'
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

type RestBalanceResponse = {
  balance: {
    denom: string
    amount: string
  }
}

/** Fetches balance via Cosmos REST API instead of StargateClient. */
const getCosmosRestBalance = async (
  chain: CosmosChain,
  address: string,
  denom: string
): Promise<bigint> => {
  const url = `${cosmosRpcUrl[chain]}/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${denom}`
  const { balance } = await queryUrl<RestBalanceResponse>(url)
  return BigInt(balance.amount)
}

export const getCosmosCoinBalance: CoinBalanceResolver<
  CosmosChain
> = async input => {
  if (input.id && isWasmToken(input.id)) {
    const url = getCosmosWasmTokenBalanceUrl(input)
    const { data } = await queryUrl<WasmQueryResponse>(url)
    return BigInt(data.balance ?? 0)
  }

  const denom = getDenom(input)

  if (restOnlyChains.includes(input.chain)) {
    return getCosmosRestBalance(input.chain, input.address, denom)
  }

  const client = await getCosmosClient(input.chain)

  const balance = await client.getBalance(input.address, denom)

  return BigInt(balance.amount)
}

type WasmQueryResponse = {
  data: {
    balance: string
  }
}
