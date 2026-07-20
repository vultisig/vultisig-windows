import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'
import { bruneBondConfig } from '@vultisig/core-chain/chains/cosmos/thor/brune-bond/config'
import { match } from '@vultisig/lib-utils/match'

import type { BrunePayload, StakeSpecific } from '../types'

/**
 * bRUNE liquid bonding via Rujira. Stake bonds bRUNE (`liquid.bond`) to receive
 * the ybRUNE auto-compounding receipt; unstake redeems ybRUNE (`liquid.unbond`)
 * back to bRUNE. Same wasm execute shape as the sTCY auto-compounder, with the
 * bRUNE contract and denoms from {@link bruneBondConfig}.
 */
export const getBruneSpecific = ({ input }: BrunePayload): StakeSpecific => {
  return match<BrunePayload['input']['kind'], StakeSpecific>(input.kind, {
    stake: () => {
      const units = toChainAmount(
        input.amount,
        bruneBondConfig.depositDecimals
      ).toString()

      return {
        kind: 'wasm',
        contract: bruneBondConfig.contract,
        executeMsg: { liquid: { bond: {} } },
        funds: [{ denom: bruneBondConfig.depositDenom, amount: units }],
      }
    },
    unstake: () => {
      const units = toChainAmount(
        input.amount,
        bruneBondConfig.shareDecimals
      ).toString()

      return {
        kind: 'wasm',
        contract: bruneBondConfig.contract,
        executeMsg: { liquid: { unbond: {} } },
        funds: [{ denom: bruneBondConfig.shareDenom, amount: units }],
      }
    },
  })
}
