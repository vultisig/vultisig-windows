import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { tcyAutoCompounderConfig } from '@core/chain/chains/cosmos/thor/tcy-autocompound/config'

import type { StakeInput, StakeKind, StakeResolver } from '../types'

export const stcyAutoSpecific: StakeResolver = {
  id: 'stcy',

  supports(coin, ctx) {
    if (ctx?.autocompound) return false
    return coin.ticker.toUpperCase() === 'TCY'
  },

  buildIntent(kind: StakeKind, input: StakeInput) {
    if (kind === 'stake') {
      const units = toChainAmount(
        (input as any).amount,
        tcyAutoCompounderConfig.depositDecimals
      ).toString()
      return {
        kind: 'wasm',
        contract: tcyAutoCompounderConfig.contract,
        executeMsg: { liquid: { bond: {} } },
        funds: [{ denom: tcyAutoCompounderConfig.depositDenom, amount: units }],
      }
    }

    if (kind === 'unstake') {
      const units = toChainAmount(
        (input as any).amount,
        tcyAutoCompounderConfig.shareDecimals
      ).toString()
      return {
        kind: 'wasm',
        contract: tcyAutoCompounderConfig.contract,
        executeMsg: { liquid: { unbond: {} } },
        // Note: funds are sTCY (the share token)
        funds: [{ denom: tcyAutoCompounderConfig.shareDenom, amount: units }],
      }
    }

    throw new Error(`Unknown stake kind for sTCY: ${kind}`)
  },
}
