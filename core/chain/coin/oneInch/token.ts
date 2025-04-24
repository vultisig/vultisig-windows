import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'

export type OneInchToken = {
  address: string
  symbol: string
  decimals: number
  name: string
  logoURI?: string
  eip2612: boolean
  tags: string[]
}

export type OneInchTokensResponse = {
  tokens: Record<string, OneInchToken>
}

type FromOneInchTokensInput = {
  tokens: OneInchToken[]
  chain: Chain
}

export const fromOneInchTokens = ({
  tokens,
  chain,
}: FromOneInchTokensInput): Coin[] => {
  const result: Coin[] = []

  tokens.forEach(token => {
    if (token.logoURI) {
      result.push({
        chain,
        id: token.address,
        decimals: token.decimals,
        logo: token.logoURI,
        ticker: token.symbol,
      })
    }
  })

  return result
}
