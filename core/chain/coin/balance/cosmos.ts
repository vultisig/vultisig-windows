import { CosmosChain } from '@core/chain/Chain'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { getCosmosClient } from '../../chains/cosmos/client'
import { cosmosFeeCoinDenom } from '../../chains/cosmos/cosmosFeeCoinDenom'
import { getCosmosWasmTokenBalanceUrl } from '../../chains/cosmos/cosmosRpcUrl'
import { isFeeCoin } from '../utils/isFeeCoin'
import { CoinBalanceResolver } from './CoinBalanceResolver'

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

  const denom = isFeeCoin(input)
    ? cosmosFeeCoinDenom[input.chain]
    : shouldBePresent(input.id)

  const balance = await client.getBalance(input.address, denom)

  return BigInt(balance.amount)
}

type WasmQueryResponse = {
  data: {
    balance: string
  }
}
