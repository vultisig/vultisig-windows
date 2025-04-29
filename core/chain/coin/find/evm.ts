import { EvmChain } from '@core/chain/Chain'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { OneInchToken } from '@core/chain/coin/oneInch/token'
import { rootApiUrl } from '@core/config'
import { withoutUndefined } from '@lib/utils/array/withoutUndefined'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { FindCoinsResolver } from './FindCoinsResolver'

export const findEvmCoins: FindCoinsResolver<EvmChain> = async ({
  address,
  chain,
}) => {
  const oneInchChainId = getEvmChainId(chain)

  const url = `${rootApiUrl}/1inch/balance/v1.2/${oneInchChainId}/balances/${address}`

  const balanceData = await queryUrl<Record<string, string>>(url)

  await new Promise(resolve => setTimeout(resolve, 1000)) // We have some rate limits on 1 inch, so I will wait a bit

  // Filter tokens with non-zero balance
  const nonZeroBalanceTokenAddresses = Object.entries(balanceData)
    .filter(([_, balance]) => BigInt(balance as string) > 0n) // Ensure the balance is non-zero
    .map(([tokenAddress]) => tokenAddress)
    .filter(
      tokenAddress =>
        tokenAddress !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    )

  if (nonZeroBalanceTokenAddresses.length === 0) {
    return []
  }

  // Fetch token information for the non-zero balance tokens
  const tokenInfoUrl = `${rootApiUrl}/1inch/token/v1.2/${oneInchChainId}/custom?addresses=${nonZeroBalanceTokenAddresses.join(',')}`
  const tokenInfoData =
    await queryUrl<Record<string, OneInchToken>>(tokenInfoUrl)

  const tokens = withoutUndefined(
    nonZeroBalanceTokenAddresses.map(
      tokenAddress => tokenInfoData[tokenAddress]
    )
  )

  const result: AccountCoin[] = []

  tokens.forEach(token => {
    if (!token.logoURI) {
      return
    }

    result.push({
      chain,
      id: token.address,
      decimals: token.decimals,
      logo: token.logoURI,
      ticker: token.symbol,
      address,
    })
  })

  return result
}
