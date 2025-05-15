import { CosmosChain } from '@core/chain/Chain'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { getCosmosClient } from '../../chains/cosmos/client'
import { cosmosFeeCoinDenom } from '../../chains/cosmos/cosmosFeeCoinDenom'
import { getCosmosWasmTokenBalanceUrl } from '../../chains/cosmos/cosmosRpcUrl'
import { CoinKey } from '../Coin'
import { isFeeCoin } from '../utils/isFeeCoin'
import { isNativeCoin } from '../utils/isNativeCoin'
import { CoinBalanceResolver } from './CoinBalanceResolver'

const isCosmosNativeCoin = (coin: CoinKey) => {
  if (
    // @antonio 'tcy' should be added as a string here, not as a token in leanChainNativeTokens.
    // TCY is both a native and non-native token—adding it to leanChainNativeTokens will break keysign.
    ['ibc/', 'factory/', '/', '.', '-', 'tcy'].some(prefix =>
      coin.id.includes(prefix)
    )
  ) {
    return true
  }

  return isNativeCoin(coin)
}

export const getCosmosCoinBalance: CoinBalanceResolver<
  CosmosChain
> = async input => {
  if (isCosmosNativeCoin(input)) {
    const client = await getCosmosClient(input.chain)

    const denom = isFeeCoin(input) ? cosmosFeeCoinDenom[input.chain] : input.id

    const balance = await client.getBalance(input.address, denom)

    return BigInt(balance.amount)
  }

  const url = getCosmosWasmTokenBalanceUrl(input)
  const { data } = await queryUrl<WasmQueryResponse>(url)
  return BigInt(data.balance ?? 0)
}

interface WasmQueryResponse {
  data: {
    balance: string
  }
}
