import { describe, expect, it, vi } from 'vitest'

import {
  formatTronResourceValue,
  formatTronWithdrawalTime,
  sunToTrx,
  trxToSun,
} from './formatTronResource'

describe('formatTronResourceValue', () => {
  it('formats values below 1000 without K notation', () => {
    expect(
      formatTronResourceValue({ available: 500, total: 800, unit: '' })
    ).toBe('500/800')
  })

  it('formats values >= 1000 with K notation when no unit', () => {
    expect(
      formatTronResourceValue({ available: 1500, total: 2000, unit: '' })
    ).toBe('1.50K/2.00K')
  })

  it('formats values >= 1000 with unit suffix', () => {
    expect(
      formatTronResourceValue({ available: 1500, total: 2000, unit: 'KB' })
    ).toBe('1.50/2.00KB')
  })

  it('handles zero values', () => {
    expect(formatTronResourceValue({ available: 0, total: 0, unit: '' })).toBe(
      '0/0'
    )
  })

  it('handles available greater than total', () => {
    expect(
      formatTronResourceValue({ available: 1200, total: 1000, unit: '' })
    ).toBe('1.20K/1.00K')
  })
})

describe('formatTronWithdrawalTime', () => {
  it('returns ready_to_claim when time has passed', () => {
    const pastTime = Date.now() - 1000
    expect(formatTronWithdrawalTime(pastTime)).toBe('ready_to_claim')
  })

  it('returns ready_to_claim when time is exactly now', () => {
    vi.useFakeTimers()
    vi.setSystemTime(1000000)
    expect(formatTronWithdrawalTime(1000000)).toBe('ready_to_claim')
    vi.useRealTimers()
  })

  it('formats days and hours when more than 1 day remaining', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const twoDaysThreeHours = 2 * 86_400_000 + 3 * 3_600_000
    expect(formatTronWithdrawalTime(twoDaysThreeHours)).toBe('2d 3h')
    vi.useRealTimers()
  })

  it('formats hours and minutes when less than 1 day remaining', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const fiveHoursTenMinutes = 5 * 3_600_000 + 10 * 60_000
    expect(formatTronWithdrawalTime(fiveHoursTenMinutes)).toBe('5h 10m')
    vi.useRealTimers()
  })

  it('formats 0h Xm for less than 1 hour', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const thirtyMinutes = 30 * 60_000
    expect(formatTronWithdrawalTime(thirtyMinutes)).toBe('0h 30m')
    vi.useRealTimers()
  })
})

describe('sunToTrx', () => {
  it('converts SUN to TRX', () => {
    expect(sunToTrx(BigInt(1_000_000))).toBe(1)
  })

  it('converts zero', () => {
    expect(sunToTrx(BigInt(0))).toBe(0)
  })

  it('converts fractional amounts', () => {
    expect(sunToTrx(BigInt(500_000))).toBe(0.5)
  })

  it('converts large amounts', () => {
    expect(sunToTrx(BigInt(100_000_000_000))).toBe(100_000)
  })
})

describe('trxToSun', () => {
  it('converts TRX to SUN', () => {
    expect(trxToSun(1)).toBe(BigInt(1_000_000))
  })

  it('converts zero', () => {
    expect(trxToSun(0)).toBe(BigInt(0))
  })

  it('converts fractional TRX', () => {
    expect(trxToSun(0.5)).toBe(BigInt(500_000))
  })

  it('rounds to nearest SUN', () => {
    expect(trxToSun(1.0000005)).toBe(BigInt(1_000_001))
  })
})
