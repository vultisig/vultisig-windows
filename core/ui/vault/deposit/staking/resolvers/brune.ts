import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'
import { bruneBondConfig } from '@vultisig/core-chain/chains/cosmos/thor/brune-bond/config'
import { match } from '@vultisig/lib-utils/match'

import type { BrunePayload, StakeSpecific } from '../types'

/**
 * bRUNE staking via Rujira liquid bonding — a wasm `MsgExecuteContract` on the
 * `bruneBondConfig` contract. Architecturally identical to the STCY
 * auto-compounder: `stake` bonds bRUNE (`liquid.bond`, funds in `x/brune`) to
 * mint the auto-compounding ybRUNE receipt; `unstake` redeems ybRUNE shares
 * (`liquid.unbond`, funds in `x/staking-x/brune`) back to bRUNE.
 */
export const getBruneSpecific = ({ input }: BrunePayload): StakeSpecific => {
  return match<BrunePayload['input']['kind'], StakeSpecific>(input.kind, {
    stake: () => {
      if (!('amount' in input)) throw new Error('Invalid amount')

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
      if (!('amount' in input)) throw new Error('Invalid amount')

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
