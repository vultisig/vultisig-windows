import { SolanaJupiterToken } from '@core/chain/coin/jupiter/token'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { TokenMetadataResolver } from '../resolver'

export const getSolanaTokenMetadata: TokenMetadataResolver = async ({ id }) => {
  const { decimals, logoURI, symbol, extensions } =
    await queryUrl<SolanaJupiterToken>(`https://tokens.jup.ag/token/${id}`)

  return {
    decimals,
    logo: logoURI,
    ticker: symbol,
    priceProviderId: extensions?.coingeckoId,
  }
}
