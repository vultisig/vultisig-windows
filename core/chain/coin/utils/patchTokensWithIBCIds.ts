import { RequiredFields } from '@lib/utils/types/RequiredFields'

import { Coin } from '../Coin'

export const patchTokensWithIBCIds = (
  tokens: RequiredFields<Coin, 'logo'>[],
  ibcTokens: Pick<RequiredFields<Coin, 'logo'>, 'ticker' | 'id'>[]
): RequiredFields<Coin, 'logo'>[] =>
  tokens.map(token => {
    if (token.id) return token
    const match = ibcTokens.find(i => i.ticker === token.ticker)
    return match ? { ...token, id: match.id } : token
  })
