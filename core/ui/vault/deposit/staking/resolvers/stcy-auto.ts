import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { tcyAutoCompounderConfig } from '@core/chain/chains/cosmos/thor/tcy-autocompound/config'
import type { AccountCoin } from '@core/chain/coin/AccountCoin'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { z } from 'zod'

import type { FieldSpec, StakeInput, StakeKind, StakeResolver } from '../types'

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

  fields(kind, t): FieldSpec[] {
    if (kind === 'stake') {
      return [
        { name: 'amount', type: 'number', label: t('amount'), required: true },
      ]
    }
    if (kind === 'unstake') {
      // For sTCY we unbond by *amount of sTCY*, not percentage
      return [
        { name: 'amount', type: 'number', label: t('amount'), required: true },
      ]
    }
    return []
  },

  schema(kind, { balance }) {
    // Keep validation simple; min/max will be enforced by wallet anyway
    return z.object({
      amount: z
        .string()
        .optional()
        .transform(v => (v == null || v === '' ? undefined : Number(v)))
        .pipe(
          kind === 'stake'
            ? z.number().positive().min(0.00000001).max(balance)
            : z
                .number()
                .positive()
                .min(1)
                .max(
                  Number.isFinite(balance) ? balance : Number.MAX_SAFE_INTEGER
                )
        )
        .optional(),
    })
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

    // We don't expose "claim" for the auto-compounder. If ever needed:
    return {
      kind: 'wasm',
      contract: tcyAutoCompounderConfig.contract,
      executeMsg: { status: {} },
      funds: [],
    }
  },
}
