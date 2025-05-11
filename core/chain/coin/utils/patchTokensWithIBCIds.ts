import { Coin } from '../Coin'

export const patchTokensWithIBCIds = (
  tokens: Coin[],
  ibcTokens: Pick<Coin, 'ticker' | 'id'>[]
): Coin[] =>
  tokens.map(token => {
    if (token.id) return token
    const match = ibcTokens.find(i => i.ticker === token.ticker)
    return match ? { ...token, id: match.id } : token
  })
