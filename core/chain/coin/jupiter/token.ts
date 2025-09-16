import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'

export type SolanaJupiterToken = {
  id: string
  name: string
  symbol: string
  decimals: number
  icon?: string
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
    .filter(token => !!token.icon) // Ensure only tokens with logos are included
    .map(token => ({
      chain,
      id: token.id,
      decimals: token.decimals,
      logo: token.icon || '',
      ticker: token.symbol,
    }))
}
