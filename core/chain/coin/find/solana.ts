import { Chain } from '@core/chain/Chain'
import { getSplAccounts } from '@core/chain/chains/solana/spl/getSplAccounts'
import { SolanaJupiterToken } from '@core/chain/coin/jupiter/token'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { FindCoinsResolver } from './FindCoinsResolver'

export const findSolanaCoins: FindCoinsResolver = async ({ address }) => {
  const accounts = await getSplAccounts(address)
  if (!accounts.length) {
    return []
  }

  const tokenAddresses = accounts.map(
    account => account.account.data.parsed.info.mint
  )

  const tokenInfos = await fetchSolanaTokenInfoList(tokenAddresses)

  return Object.entries(tokenInfos).map(([, token]) => ({
    chain: Chain.Solana,
    id: token.address,
    decimals: token.decimals,
    logo: token.logoURI || '',
    ticker: token.symbol,
    priceProviderId: token.extensions?.coingeckoId || '',
    address,
  }))
}

const fetchSolanaTokenInfoList = async (
  contractAddresses: string[]
): Promise<Record<string, any>> => {
  const results: Record<string, any> = {}

  const tokenInfoListPromise = contractAddresses.map(async address => {
    const data = await queryUrl<SolanaJupiterToken>(
      `https://tokens.jup.ag/token/${address}`
    )
    results[address] = data
  })

  await Promise.all(tokenInfoListPromise)

  return results
}
