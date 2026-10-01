import { range } from '@vultisig/lib-utils/array/range'
import { describe, expect, it } from 'vitest'

import { toRecentBondChurns } from './churns'
import { bondRewardHistoryLimit } from './config'

describe('toRecentBondChurns', () => {
  it('reads Midgard nanosecond dates, newest first', () => {
    const churns = toRecentBondChurns([
      { height: '27870000', date: '1789642800000000000' },
      { height: '27914370', date: '1789925100000000000' },
    ])

    expect(churns).toEqual([
      { height: 27914370, date: new Date('2026-09-20T17:25:00.000Z') },
      { height: 27870000, date: new Date('2026-09-17T11:00:00.000Z') },
    ])
  })

  it('drops entries it cannot read', () => {
    const churns = toRecentBondChurns([
      { height: '100', date: '1000000000000' },
      { height: 'bad', date: '1000000000000' },
      { height: '200' },
    ])

    expect(churns.map(({ height }) => height)).toEqual([100])
  })

  it('keeps only as many churns as the history walks', () => {
    const churns = toRecentBondChurns(
      range(bondRewardHistoryLimit + 5).map(index => ({
        height: String(index + 1),
        date: String((index + 1) * 1_000_000_000),
      }))
    )

    expect(churns).toHaveLength(bondRewardHistoryLimit)
    expect(churns[0].height).toBe(bondRewardHistoryLimit + 5)
  })
})
