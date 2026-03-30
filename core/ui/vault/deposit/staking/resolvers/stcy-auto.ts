import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'
import { tcyAutoCompounderConfig } from '@vultisig/core-chain/chains/cosmos/thor/tcy-autocompound/config'
import { knownCosmosTokens } from '@vultisig/core-chain/coin/knownTokens/cosmos'
import { match } from '@vultisig/lib-utils/match'

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
        knownCosmosTokens.THORChain['x/staking-tcy'].decimals
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
