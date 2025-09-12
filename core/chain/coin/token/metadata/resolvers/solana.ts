import { SolanaJupiterToken } from '@core/chain/coin/jupiter/token'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { getSolanaCoingeckoId } from '../../../coingecko/getCoingeckoId'
import { TokenMetadataResolver } from '../resolver'

export const baseJupiterTokensUrl = 'https://lite-api.jup.ag/tokens/v2'

export const getSolanaTokenMetadata: TokenMetadataResolver = async ({ id }) => {
  const [{ decimals, icon, symbol }] = await queryUrl<SolanaJupiterToken[]>(
    `${baseJupiterTokensUrl}/search?query=${id}`
  )
  const coingeckoId = await getSolanaCoingeckoId({ id })

  return {
    decimals,
    logo: icon,
    ticker: symbol,
    priceProviderId: coingeckoId,
  }
}
