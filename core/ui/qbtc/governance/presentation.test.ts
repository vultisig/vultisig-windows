import { describe, expect, it } from 'vitest'

import { getQbtcVotingRemaining } from './presentation'

describe('getQbtcVotingRemaining', () => {
  const nowMs = Date.parse('2026-01-01T00:00:00Z')

  it('returns undefined without an end time', () => {
    expect(
      getQbtcVotingRemaining({ votingEndTime: undefined, nowMs })
    ).toBeUndefined()
  })

  it('flags an elapsed voting window as ended', () => {
    expect(
      getQbtcVotingRemaining({
        votingEndTime: '2025-12-31T23:59:00Z',
        nowMs,
      })
    ).toEqual({ ended: true })
  })

  it('breaks remaining time into days/hours/minutes', () => {
    expect(
      getQbtcVotingRemaining({
        votingEndTime: '2026-01-02T04:30:00Z',
        nowMs,
      })
    ).toEqual({ ended: false, days: 1, hours: 4, minutes: 30 })
  })
})
