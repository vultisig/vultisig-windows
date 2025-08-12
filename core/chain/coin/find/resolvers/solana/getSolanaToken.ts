import { Chain } from '@core/chain/Chain'
import { Coin, Token } from '@core/chain/coin/Coin'
import { SolanaJupiterToken } from '@core/chain/coin/jupiter/token'
import { queryUrl } from '@lib/utils/query/queryUrl'

export const getSolanaToken = async (address: string): Promise<Token<Coin>> => {
  const { decimals, logoURI, symbol, extensions } =
    await queryUrl<SolanaJupiterToken>(`https://tokens.jup.ag/token/${address}`)

  return {
    id: address,
    decimals,
    logo: logoURI,
    ticker: symbol,
    priceProviderId: extensions?.coingeckoId,
    chain: Chain.Solana,
  }
}
