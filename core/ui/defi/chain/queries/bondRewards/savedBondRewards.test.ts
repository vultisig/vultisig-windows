import { range } from '@vultisig/lib-utils/array/range'
import { describe, expect, it } from 'vitest'

import {
  fromSavedBondRewardRows,
  mergeSavedBondRewardRows,
} from './savedBondRewards'

const toReading = (height: number, amount: bigint | null) => ({
  height,
  date: new Date(height * 1000),
  amount,
})

describe('mergeSavedBondRewardRows', () => {
  it('keeps every churn ever saved', () => {
    const first = mergeSavedBondRewardRows({
      readings: range(30).map(index => toReading(index + 1, 1n)),
    })
    const rows = mergeSavedBondRewardRows({
      rows: first,
      readings: range(30).map(index => toReading(index + 31, 2n)),
    })

    expect(Object.keys(rows)).toHaveLength(60)
  })

  it('round-trips amounts, zero payouts and churns that were not a position', () => {
    const readings = [
      toReading(300, 73685323075n),
      toReading(200, 0n),
      toReading(100, null),
    ]

    const restored = fromSavedBondRewardRows(
      JSON.parse(JSON.stringify(mergeSavedBondRewardRows({ readings })))
    )

    expect(restored.sort((a, b) => b.height - a.height)).toEqual(readings)
  })
})
