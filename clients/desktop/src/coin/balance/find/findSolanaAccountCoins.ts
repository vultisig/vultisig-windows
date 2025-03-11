import { Chain } from '@core/chain/Chain'
import { ChainAccount } from '@core/chain/ChainAccount'
import { getSplAccounts } from '@core/chain/chains/solana/spl/getSplAccounts'
import { Coin } from '@core/chain/coin/Coin'
import { SolanaJupiterToken } from '@core/chain/coin/jupiter/token'
import { queryUrl } from '@lib/utils/query/queryUrl'

export const findSolanaAccountCoins = async (account: ChainAccount) => {
  if (!account.address) {
    throw new Error('Invalid native token: Address is required')
  }

  const accounts = await getSplAccounts(account.address)
  if (!accounts.length) {
    return []
  }

  const tokenAddresses = accounts.map(
    account => account.account.data.parsed.info.mint
  )

  const tokenInfos = await fetchSolanaTokenInfoList(tokenAddresses)

  return Object.entries(tokenInfos).map(([, token]) => {
    const coin: Coin = {
      chain: Chain.Solana,
      id: token.address,
      decimals: token.decimals,
      logo: token.logoURI || '',
      ticker: token.symbol,
      priceProviderId: token.extensions?.coingeckoId || '',
    }

    return coin
  })
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
