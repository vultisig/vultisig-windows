import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'
import { CosmosChain } from '@vultisig/core-chain/Chain'
import { rujiraStakingConfig } from '@vultisig/core-chain/chains/cosmos/thor/rujira/config'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { getDenom } from '@vultisig/core-chain/coin/utils/getDenom'
import { match } from '@vultisig/lib-utils/match'

import { RujiPayload, StakeSpecific } from '../types'

export function getRujiSpecific({ coin, input }: RujiPayload): StakeSpecific {
  const denom =
    getDenom(coin as CoinKey<CosmosChain>) ?? rujiraStakingConfig.bondDenom

  return match<RujiPayload['input']['kind'], StakeSpecific>(input.kind, {
    stake: () => {
      if (!('amount' in input)) {
        throw new Error('Invalid amount')
      }

      const amountUnits = toChainAmount(input.amount, coin.decimals).toString()
      return {
        kind: 'wasm',
        contract: rujiraStakingConfig.contract,
        executeMsg: { account: { bond: {} } },
        funds: [{ denom, amount: amountUnits }],
      }
    },
    unstake: () => {
      if (!('amount' in input)) {
        throw new Error('Invalid amount')
      }

      const amountUnits = toChainAmount(input.amount, coin.decimals).toString()
      return {
        kind: 'wasm',
        contract: rujiraStakingConfig.contract,
        executeMsg: { account: { withdraw: { amount: amountUnits } } },
        funds: [],
      }
    },
    claim: () => ({
      kind: 'wasm',
      contract: rujiraStakingConfig.contract,
      executeMsg: { account: { claim: {} } },
      funds: [],
    }),
  })
}
