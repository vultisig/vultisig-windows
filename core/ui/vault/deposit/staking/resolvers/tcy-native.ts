import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { z } from 'zod'

import {
  FieldSpec,
  StakeInput,
  StakeKind,
  StakeResolver,
  StakeSpecific,
} from '../types'

export const nativeTcySpecific: StakeResolver = {
  id: 'native-tcy',

  supports(coin) {
    return (
      coin.ticker.toUpperCase() ===
      knownCosmosTokens['THORChain']['tcy'].ticker.toUpperCase()
    )
  },

  fields(verb, t): FieldSpec[] {
    if (verb === 'stake')
      return [
        { name: 'amount', type: 'number', label: t('amount'), required: true },
      ]
    if (verb === 'unstake')
      return [
        {
          name: 'percentage',
          type: 'percentage',
          label: t('percentage'),
          required: true,
        },
      ]
    return [] // claim not supported for TCY native (no distinct claim verb)
  },

  schema(verb, { balance, t }) {
    if (verb === 'stake') {
      return z.object({
        amount: z
          .string()
          .transform(Number)
          .pipe(z.number().positive().min(0.0001).max(balance)),
      })
    }
    if (verb === 'unstake') {
      return z.object({
        percentage: z
          .string()
          .transform(Number)
          .pipe(z.number().positive().max(100, t('Percentage must be 0-100'))),
      })
    }
    return z.object({})
  },

  buildIntent(verb: StakeKind, input: StakeInput, { coin }): StakeSpecific {
    if (verb === 'stake') {
      const units = toChainAmount(
        (input as any).amount,
        coin.decimals
      ).toString()
      return {
        kind: 'memo',
        memo: 'tcy+',
        toAmount: units, // deposit amount
      }
    }

    if (verb === 'unstake') {
      const bps = Math.floor((input as any).percentage * 100) // basis points
      return {
        kind: 'memo',
        memo: `tcy-:${bps}`,
        toAmount: '0',
      }
    }

    return { kind: 'memo', memo: '', toAmount: '0' }
  },
}
