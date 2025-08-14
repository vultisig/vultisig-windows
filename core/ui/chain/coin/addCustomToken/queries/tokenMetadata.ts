import { CoinKey, Token } from '@core/chain/coin/Coin'
import { getTokenMetadata } from '@core/chain/coin/token/metadata'
import { useQuery } from '@tanstack/react-query'

export const useTokenMetadataQuery = (input: Token<CoinKey<any>>) => {
  return useQuery({
    queryKey: ['token-metadata', input],
    queryFn: () => getTokenMetadata(input),
  })
}
