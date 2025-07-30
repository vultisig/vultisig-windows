import { queryUrl } from '@lib/utils/query/queryUrl'

import { Chain } from '../../../Chain'
import { Coin, Token } from '../../Coin'
import { SolanaJupiterToken } from '../../jupiter/token'

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
