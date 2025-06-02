import { EvmChain } from '@core/chain/Chain'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'
import { queryOneInch } from '@core/chain/coin/find/evm/queryOneInch'
import { FindCoinsResolver } from '@core/chain/coin/find/FindCoinsResolver'
import { OneInchToken } from '@core/chain/coin/oneInch/token'
import { withoutUndefined } from '@lib/utils/array/withoutUndefined'
import { attempt } from '@lib/utils/attempt'
import { NoDataError } from '@lib/utils/error/NoDataError'
import { hexToNumber } from '@lib/utils/hex/hexToNumber'

export const findEvmCoins: FindCoinsResolver<EvmChain> = async ({
  address,
  chain,
}) => {
  const oneInchChainId = hexToNumber(getEvmChainId(chain))

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

  return withoutUndefined(
    tokens.map(token => {
      if (token.logoURI && token.providers.includes('CoinGecko')) {
        return {
          chain,
          id: token.address,
          decimals: token.decimals,
          logo: token.logoURI,
          ticker: token.symbol,
          address,
        }
      }
    })
  )
}
