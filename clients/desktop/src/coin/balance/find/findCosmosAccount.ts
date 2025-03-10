import { CosmosChain } from '@core/chain/Chain'
import { ChainAccount } from '@core/chain/ChainAccount'
import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { chainTokens } from '@core/chain/coin/chainTokens'
import { Coin } from '@core/chain/coin/Coin'
import { queryUrl } from '@lib/utils/query/queryUrl'

interface CosmosBalance {
  denom: string
  amount: string
}

interface CosmosPagination {
  next_key: string | null
  total: string
}

interface CosmosBalanceResponse {
  balances: CosmosBalance[]
  pagination: CosmosPagination
}

export const findCosmosAccountCoins = async (
  account: ChainAccount<CosmosChain>
) => {
  const rpcUrl = cosmosRpcUrl[account.chain]

  const url = `${rpcUrl}/cosmos/bank/v1beta1/balances/${account.address}`

  const balanceData = await queryUrl<CosmosBalanceResponse>(url)

  await new Promise(resolve => setTimeout(resolve, 1000)) // We have some rate limits on 1 inch, so I will wait a bit

  const cosmosTokens = chainTokens[account.chain]

  if (!cosmosTokens) {
    return []
  }

  const tokens: Coin[] = cosmosTokens
    .filter(token =>
      balanceData.balances.some(balance => token.id === balance.denom)
    )
    .map(token => {
      const balance = balanceData.balances.find(
        balance => token.id === balance.denom
      )?.amount
      return {
        ...token,
        balance,
      }
    })

  return tokens
}
