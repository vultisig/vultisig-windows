import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { tcyAutoCompounderConfig } from '@core/chain/chains/cosmos/thor/tcy-autocompound/config'
import type { AccountCoin } from '@core/chain/coin/AccountCoin'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'

import type { StakeInput, StakeKind, StakeResolver } from '../types'

const isSTCY = (c: AccountCoin) =>
  c.ticker.toUpperCase() ===
    tcyAutoCompounderConfig.shareTicker.toUpperCase() ||
  c.id === tcyAutoCompounderConfig.shareDenom

export const stcyAutoSpecific: StakeResolver = {
  id: 'stcy',

  supports(coin, ctx) {
    // Stake: coin is TCY + toggle on. Unstake: coin may be TCY (UI) but we still want this when toggle is on,
    // or coin is sTCY if UI ever lets users pick it directly.
    if (
      ctx?.autocompound &&
      coin.ticker.toUpperCase() ===
        knownCosmosTokens['THORChain']['tcy'].ticker.toUpperCase()
    )
      return true
    if (isSTCY(coin)) return true
    return false
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
