import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { StakeInput, StakeKind, StakeResolver, StakeSpecific } from '../types'

export const nativeTcySpecific: StakeResolver = {
  id: 'native-tcy',

  supports(coin) {
    return (
      coin.ticker.toUpperCase() ===
      knownCosmosTokens['THORChain']['tcy'].ticker.toUpperCase()
    )
  },

  buildIntent(verb: StakeKind, input: StakeInput, { coin }): StakeSpecific {
    if (verb === 'stake') {
      if ('amount' in input) {
        const units = toChainAmount(
          shouldBePresent(input.amount),
          coin.decimals
        ).toString()

        return {
          kind: 'memo',
          memo: 'tcy+',
          toAmount: units,
        }
      } else {
        throw new Error('Invalid amount')
      }
    }

    if (verb === 'unstake') {
      const bps = Math.floor((input as any).percentage * 100)
      return {
        kind: 'memo',
        memo: `tcy-:${bps}`,
        toAmount: '0',
      }
    }

    return { kind: 'memo', memo: '', toAmount: '0' }
  },
}
