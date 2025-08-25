import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { CoinKey } from '@core/chain/coin/Coin'

import { assertKnownToken } from '../knownTokens/utils'

export const makeAccountCoin = <C extends Chain>(
  key: Required<Pick<CoinKey<C>, 'chain' | 'id'>>,
  address: string
): AccountCoin => ({
  ...assertKnownToken(key),
  address,
})
