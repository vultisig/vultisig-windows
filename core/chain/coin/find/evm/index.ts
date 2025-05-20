import { EvmChain } from '@core/chain/Chain'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { OneInchToken } from '@core/chain/coin/oneInch/token'
import { withoutUndefined } from '@lib/utils/array/withoutUndefined'
import { attempt } from '@lib/utils/attempt'
import { NoDataError } from '@lib/utils/error/NoDataError'

import { FindCoinsResolver } from '../FindCoinsResolver'
import { queryOneInch } from './queryOneInch'

export const findEvmCoins: FindCoinsResolver<EvmChain> = async ({
  address,
  chain,
}) => {
  const oneInchChainId = getEvmChainId(chain)

  const balanceResult = await attempt(
    queryOneInch<Record<string, string>>(
      `/balance/v1.2/${oneInchChainId}/balances/${address}`
    )
  )

  if ('error' in balanceResult) {
    if (balanceResult.error instanceof NoDataError) {
      return []
    }

    throw balanceResult.error
  }

  const balanceData = balanceResult.data

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

  // Fetch token information for the non-zero balance tokens using queryOneInch
  const tokenInfoData = await queryOneInch<Record<string, OneInchToken>>(
    `/token/v1.2/${oneInchChainId}/custom?addresses=${nonZeroBalanceTokenAddresses.join(',')}`
  )

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
