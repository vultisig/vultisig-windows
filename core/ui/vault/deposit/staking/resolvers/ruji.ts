import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { CosmosChain } from '@core/chain/Chain'
import { rujiraStakingConfig } from '@core/chain/chains/cosmos/thor/rujira/config'
import { CoinKey } from '@core/chain/coin/Coin'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { getDenom } from '@core/chain/coin/utils/getDenom'

import { StakeInput, StakeKind, StakeResolver, StakeSpecific } from '../types'

export const rujiSpecific: StakeResolver = {
  id: 'ruji',

  supports(coin) {
    // We key off ticker or denom (be robust if the ticker casing changes)
    return (
      coin.ticker?.toUpperCase() ===
      knownCosmosTokens['THORChain']['x/ruji'].ticker.toUpperCase()
    )
  },

  buildIntent(verb: StakeKind, input: StakeInput, { coin }): StakeSpecific {
    const denom =
      getDenom(coin as CoinKey<CosmosChain>) ?? rujiraStakingConfig.bondDenom

    if (verb === 'stake') {
      const amountUnits = toChainAmount(
        (input as any).amount,
        coin.decimals
      ).toString()
      // CosmWasm execute: { account: { bond: {} } } with funds RUJI denom
      return {
        kind: 'wasm',
        contract: rujiraStakingConfig.contract,
        executeMsg: { account: { bond: {} } },
        funds: [{ denom, amount: amountUnits }],
      }
    }

    if (verb === 'unstake') {
      const amountUnits = toChainAmount(
        (input as any).amount,
        coin.decimals
      ).toString()
      return {
        kind: 'wasm',
        contract: rujiraStakingConfig.contract,
        executeMsg: { account: { withdraw: { amount: amountUnits } } },
        funds: [],
      }
    }

    // claim rewards
    return {
      kind: 'wasm',
      contract: rujiraStakingConfig.contract,
      executeMsg: { account: { claim: {} } },
      funds: [],
    }
  },
}
