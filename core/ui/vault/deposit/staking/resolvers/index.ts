import { AccountCoin } from '@core/chain/coin/AccountCoin'

import { StakeResolver } from '../types'
import { rujiSpecific } from './ruji'
import { stcyAutoSpecific } from './stcy-auto'
import { nativeTcySpecific } from './tcy-native'

const resolvers: StakeResolver[] = [
  rujiSpecific,
  nativeTcySpecific,
  stcyAutoSpecific,
]

export function getStakeSpecific(
  coin: AccountCoin,
  ctx?: { autocompound?: boolean }
): StakeResolver {
  const p = resolvers.find(p => p.supports(coin, ctx))

  if (!p)
    throw new Error(
      `No staking provider found for ${coin.chain}:${coin.ticker}`
    )

  return p
}
