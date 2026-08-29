import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'
import { describe, expect, it } from 'vitest'

import { formatLimitChartRelativeTime } from './relativeTime'

const now = Date.UTC(2026, 0, 15, 12, 0, 0)

const format = (ago: number) =>
  formatLimitChartRelativeTime({ timestamp: now - ago, now, locale: 'en-US' })

describe('formatLimitChartRelativeTime', () => {
  it('picks the coarsest unit that still counts', () => {
    expect(format(convertDuration(3, 'min', 'ms'))).toBe('3 minutes ago')
    expect(format(convertDuration(5, 'h', 'ms'))).toBe('5 hours ago')
    expect(format(convertDuration(3, 'd', 'ms'))).toBe('3 days ago')
    expect(format(convertDuration(400, 'd', 'ms'))).toBe('last year')
  })

  it('never reports less than a minute', () => {
    expect(format(0)).toBe('1 minute ago')
    expect(format(convertDuration(2, 's', 'ms'))).toBe('1 minute ago')
  })

  it('never phrases a crossing in the future', () => {
    expect(format(-convertDuration(1, 'h', 'ms'))).toBe('1 minute ago')
  })
})
