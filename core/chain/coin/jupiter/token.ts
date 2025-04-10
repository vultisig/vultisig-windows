import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'

export type SolanaJupiterToken = {
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI?: string
  extensions?: {
    coingeckoId?: string
  }
}

type FromSolanaJupiterTokensInput = {
  tokens: SolanaJupiterToken[]
  chain: Chain
}

export const fromSolanaJupiterTokens = ({
  tokens,
  chain,
}: FromSolanaJupiterTokensInput): Coin[] => {
  return tokens
    .filter(token => !!token.logoURI) // Ensure only tokens with logos are included
    .map(token => ({
      chain,
      id: token.address,
      decimals: token.decimals,
      logo: token.logoURI || '',
      ticker: token.symbol,
      priceProviderId: token.extensions?.coingeckoId || '',
    }))
}
