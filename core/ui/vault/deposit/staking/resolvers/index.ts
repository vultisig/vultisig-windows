import { CosmosChain } from '@core/chain/Chain'
import { rujiraStakingConfig } from '@core/chain/chains/cosmos/thor/rujira/config'
import type { AccountCoin } from '@core/chain/coin/AccountCoin'
import { CoinKey } from '@core/chain/coin/Coin'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { getDenom } from '@core/chain/coin/utils/getDenom'

import type { StakeId, StakeResolverMap } from '../types'
import { getRujiSpecific } from './ruji'
import { getStcySpecific } from './stcy-auto'
import { getNativeTcySpecific } from './tcy-native'

export const resolvers = {
  ruji: getRujiSpecific,
  'native-tcy': getNativeTcySpecific,
  stcy: getStcySpecific,
} as const satisfies StakeResolverMap

export const selectStakeId = (
  coin: AccountCoin,
  ctx?: { autocompound?: boolean }
): StakeId => {
  const tcy = knownCosmosTokens['THORChain']['tcy'].ticker.toUpperCase()

  if (ctx?.autocompound && coin.ticker.toUpperCase() === tcy) return 'stcy'
  if (!ctx?.autocompound && coin.ticker.toUpperCase() === tcy)
    return 'native-tcy'

  const denom = getDenom(coin as CoinKey<CosmosChain>)

  const rujiByTicker =
    coin.ticker?.toUpperCase() ===
    knownCosmosTokens['THORChain']['x/ruji'].ticker.toUpperCase()

  const rujiByDenom =
    denom === rujiraStakingConfig.bondDenom ||
    coin.id === rujiraStakingConfig.bondDenom

  if (rujiByTicker || rujiByDenom) return 'ruji'

  throw new Error(`No staking provider found for ${coin.chain}:${coin.ticker}`)
}
