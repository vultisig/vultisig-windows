import {
  byteFeeMultiplier,
  UtxoFeeSettings,
} from '@core/chain/tx/fee/utxo/UtxoFeeSettings'
import { multiplyBigInt } from '@lib/utils/bigint/bigIntMultiplyByNumber'
import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { FeeQuote } from './core'
import { FeeSettings, FeeSettingsChainKind } from './settings/core'

type ApplyFeeSettingsInput<
  K extends FeeSettingsChainKind = FeeSettingsChainKind,
> = {
  chainKind: K
  quote: FeeQuote<K>
  settings: FeeSettings<K>
}

export const applyFeeSettings = <K extends FeeSettingsChainKind>({
  chainKind,
  quote,
  settings,
}: ApplyFeeSettingsInput<K>): FeeQuote<K> =>
  match<FeeSettingsChainKind, FeeQuote<K>>(chainKind, {
    evm: () => ({
      ...quote,
      ...settings,
    }),
    utxo: () =>
      matchRecordUnion(settings as UtxoFeeSettings, {
        byteFee: byteFee => ({
          ...quote,
          byteFee,
        }),
        priority: priority => ({
          ...quote,
          byteFee: multiplyBigInt(
            (quote as FeeQuote<'utxo'>).byteFee,
            byteFeeMultiplier[priority]
          ),
        }),
      }),
  })
