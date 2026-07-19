import { CosmosChain } from '@vultisig/core-chain/Chain'
import { bruneBondConfig } from '@vultisig/core-chain/chains/cosmos/thor/brune-bond/config'
import { rujiraStakingConfig } from '@vultisig/core-chain/chains/cosmos/thor/rujira/config'
import type { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { knownCosmosTokens } from '@vultisig/core-chain/coin/knownTokens/cosmos'
import { getDenom } from '@vultisig/core-chain/coin/utils/getDenom'

import type { StakeId, StakeResolverMap } from '../types'
import { getBruneSpecific } from './brune'
import { getRujiSpecific } from './ruji'
import { getStcySpecific } from './stcy-auto'
import { getNativeTcySpecific } from './tcy-native'

export const resolvers = {
  ruji: getRujiSpecific,
  'native-tcy': getNativeTcySpecific,
  stcy: getStcySpecific,
  brune: getBruneSpecific,
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

  const bruneByDenom =
    denom === bruneBondConfig.depositDenom ||
    coin.id === bruneBondConfig.depositDenom

  if (bruneByDenom) return 'brune'

  const rujiByTicker =
    coin.ticker?.toUpperCase() ===
    knownCosmosTokens['THORChain']['x/ruji'].ticker.toUpperCase()

  const rujiByDenom =
    denom === rujiraStakingConfig.bondDenom ||
    coin.id === rujiraStakingConfig.bondDenom

  if (rujiByTicker || rujiByDenom) return 'ruji'

  throw new Error(`No staking provider found for ${coin.chain}:${coin.ticker}`)
}
