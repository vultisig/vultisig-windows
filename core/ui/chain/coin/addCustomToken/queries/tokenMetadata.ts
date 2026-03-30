import { useQuery } from '@tanstack/react-query'
import { CoinKey, Token } from '@vultisig/core-chain/coin/Coin'
import { getTokenMetadata } from '@vultisig/core-chain/coin/token/metadata'

export const useTokenMetadataQuery = (input: Token<CoinKey<any>>) => {
  return useQuery({
    queryKey: ['token-metadata', input],
    queryFn: () => getTokenMetadata(input),
  })
}
