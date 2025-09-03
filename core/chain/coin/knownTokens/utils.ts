import { Chain } from '@core/chain/Chain'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { CoinKey, KnownCoin, Token } from '../Coin'
import { knownTokensIndex } from '.'

const getKnownToken = <C extends Chain>(
  key: Token<CoinKey<C>>
): (KnownCoin & { chain: C }) | undefined => {
  return knownTokensIndex[key.chain]?.[key.id.toLowerCase()] as
    | (KnownCoin & { chain: C })
    | undefined
}

export const assertKnownToken = <C extends Chain>(
  key: Token<CoinKey<C>>
): KnownCoin & { chain: C } => shouldBePresent(getKnownToken(key))
