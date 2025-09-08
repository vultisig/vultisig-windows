import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { tcyAutoCompounderConfig } from '@core/chain/chains/cosmos/thor/tcy-autocompound/config'
import { match } from '@lib/utils/match'

import type { StakeSpecific, StcyPayload } from '../types'

export const getStcySpecific = ({ input }: StcyPayload): StakeSpecific => {
  return match<StcyPayload['input']['kind'], StakeSpecific>(input.kind, {
    stake: () => {
      if (!('amount' in input)) throw new Error('Invalid amount')

      const units = toChainAmount(
        input.amount,
        tcyAutoCompounderConfig.depositDecimals
      ).toString()

      return {
        kind: 'wasm',
        contract: tcyAutoCompounderConfig.contract,
        executeMsg: { liquid: { bond: {} } },
        funds: [{ denom: tcyAutoCompounderConfig.depositDenom, amount: units }],
      }
    },
    unstake: () => {
      if (!('amount' in input)) throw new Error('Invalid amount')

      const units = toChainAmount(
        input.amount,
        tcyAutoCompounderConfig.shareDecimals
      ).toString()

      return {
        kind: 'wasm',
        contract: tcyAutoCompounderConfig.contract,
        executeMsg: { liquid: { unbond: {} } },
        funds: [{ denom: tcyAutoCompounderConfig.shareDenom, amount: units }],
      }
    },
  })
}
