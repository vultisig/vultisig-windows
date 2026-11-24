import { SavedBondRewardRows } from '@core/ui/storage/bondRewardHistory'

import { BondChurnReading } from './collectBondRewardHistory'
import { BondChain } from './config'

type GetSavedBondRewardsKeyInput = {
  chain: BondChain
  nodeAddress: string
  bondAddress: string
}

/** Where one bond provider's churns on one node are saved. */
export const getSavedBondRewardsKey = ({
  chain,
  nodeAddress,
  bondAddress,
}: GetSavedBondRewardsKeyInput) =>
  `${chain}:${nodeAddress.toLowerCase()}:${bondAddress.toLowerCase()}`

/** Reads saved rows back into churn readings. */
export const fromSavedBondRewardRows = (
  rows: SavedBondRewardRows = {}
): BondChurnReading[] =>
  Object.entries(rows).map(([height, { date, amount }]) => ({
    height: Number(height),
    date: new Date(date),
    amount: amount === null ? null : BigInt(amount),
  }))

type MergeSavedBondRewardRowsInput = {
  rows?: SavedBondRewardRows
  readings: BondChurnReading[]
}

/** Adds new readings to the saved rows; nothing is ever dropped. */
export const mergeSavedBondRewardRows = ({
  rows = {},
  readings,
}: MergeSavedBondRewardRowsInput): SavedBondRewardRows => ({
  ...rows,
  ...Object.fromEntries(
    readings.map(({ height, date, amount }) => [
      height,
      {
        date: date.getTime(),
        amount: amount === null ? null : amount.toString(),
      },
    ])
  ),
})
