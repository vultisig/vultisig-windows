import { bigIntSum } from '@vultisig/lib-utils/bigint/bigIntSum'
import { describe, expect, it } from 'vitest'

import { toTcyRewardHistory } from './tcyRewardHistory'

describe('toTcyRewardHistory', () => {
  it('has no payouts for an address that never staked', () => {
    expect(toTcyRewardHistory(null)).toEqual([])
  })

  it('reads Midgard second dates, newest first', () => {
    const history = toTcyRewardHistory([
      { amount: '1200000', date: '1789642800' },
      { amount: '3400000', date: '1789925100' },
      { amount: '560000', date: '1789729200' },
    ])

    expect(history).toEqual([
      { amount: 3400000n, date: new Date('2026-09-20T17:25:00.000Z') },
      { amount: 560000n, date: new Date('2026-09-18T11:00:00.000Z') },
      { amount: 1200000n, date: new Date('2026-09-17T11:00:00.000Z') },
    ])
  })

  it('drops entries it cannot read', () => {
    const history = toTcyRewardHistory([
      { amount: '100', date: '1789642800' },
      { amount: 'bad', date: '1789642801' },
      { amount: '1.5', date: '1789642802' },
      { amount: '0', date: '1789642803' },
      { amount: '-7', date: '1789642804' },
      { amount: '200', date: 'bad' },
      { amount: '300', date: '0' },
      { amount: '400' },
      { date: '1789642805' },
    ])

    expect(history.map(({ amount }) => amount)).toEqual([100n])
  })

  it('totals to the sum Midgard reports', () => {
    const history = toTcyRewardHistory([
      { amount: '98765432', date: '1789642800' },
      { amount: '12345678', date: '1789729200' },
      { amount: '1', date: '1789815600' },
    ])

    expect(bigIntSum(history.map(({ amount }) => amount))).toBe(111111111n)
  })
})
