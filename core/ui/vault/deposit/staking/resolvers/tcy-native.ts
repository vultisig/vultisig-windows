import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'

import { NativeTcyPayload, StakeSpecific } from '../types'

export const getNativeTcySpecific = ({
  coin,
  input,
}: NativeTcyPayload): StakeSpecific => {
  return match(input.kind, {
    stake: () => {
      if (!('amount' in input)) throw new Error('Invalid amount')
      const units = toChainAmount(
        shouldBePresent(input.amount),
        coin.decimals
      ).toString()

      return { kind: 'memo', memo: 'tcy+', toAmount: units }
    },
    unstake: () => {
      if (!('percentage' in input) || !Number.isFinite(input.percentage)) {
        throw new Error('unstake_requires_percentage')
      }
      const pct = Math.min(100, Math.max(0, input.percentage))
      const bps = Math.round(pct * 100)
      return { kind: 'memo', memo: `tcy-:${bps}`, toAmount: '0' }
    },
    claim: () => ({ kind: 'memo', memo: '', toAmount: '0' }),
  })
}
