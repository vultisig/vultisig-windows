import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'

import {
  CosmosSignDataCoin,
  CosmosSignDataTransfer,
} from './getCosmosSignDataReview'

/**
 * Collapses the signed transfers into one summary: every distinct recipient
 * and memo, and one total per coin, each in the order it first appears.
 */
export const summarizeCosmosSignDataTransfers = (
  transfers: CosmosSignDataTransfer[]
) => ({
  recipients: withoutDuplicates(transfers.map(({ recipient }) => recipient)),
  coins: transfers.reduce<CosmosSignDataCoin[]>(
    (totals, { coin }) =>
      totals.some(({ denom }) => denom === coin.denom)
        ? totals.map(total =>
            total.denom === coin.denom
              ? { denom: total.denom, amount: total.amount + coin.amount }
              : total
          )
        : [...totals, coin],
    []
  ),
  memos: withoutDuplicates(transfers.map(({ memo }) => memo)),
})
