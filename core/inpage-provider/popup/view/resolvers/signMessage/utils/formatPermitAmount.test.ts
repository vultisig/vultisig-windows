import { describe, expect, it } from 'vitest'

import { formatPermitAmount } from './formatPermitAmount'

const maxUint256 = 2n ** 256n - 1n
const maxUint160 = 2n ** 160n - 1n

describe('formatPermitAmount', () => {
  it('formats a finite Permit2 amount in token units', () => {
    expect(
      formatPermitAmount({
        amount: 1_000_000n,
        primaryType: 'PermitSingle',
        decimals: 6,
      })
    ).toBe('1')
  })

  it('keeps fractional digits', () => {
    expect(
      formatPermitAmount({
        amount: 1_234_567n,
        primaryType: 'PermitBatch',
        decimals: 6,
      })
    ).toBe('1.234567')
  })

  it('keeps every whole digit of a large amount', () => {
    expect(
      formatPermitAmount({
        amount: 123_456_789_012_345_678_901_234_567_890n,
        primaryType: 'Permit',
        decimals: 18,
      })
    ).toBe('123456789012.345678')
  })

  it('treats the uint160 max as unlimited for Permit2 allowances', () => {
    for (const primaryType of ['PermitSingle', 'PermitBatch']) {
      expect(
        formatPermitAmount({ amount: maxUint160, primaryType, decimals: 6 })
      ).toBeNull()
    }
  })

  it('treats the uint256 max as unlimited for every permit type', () => {
    for (const primaryType of [
      'Permit',
      'PermitSingle',
      'PermitBatch',
      'PermitTransferFrom',
      'PermitBatchTransferFrom',
    ]) {
      expect(
        formatPermitAmount({ amount: maxUint256, primaryType, decimals: 6 })
      ).toBeNull()
    }
  })

  it('shows the uint160 max as a number for uint256 permits', () => {
    expect(
      formatPermitAmount({
        amount: maxUint160,
        primaryType: 'Permit',
        decimals: 0,
      })
    ).toBe(maxUint160.toString())
  })

  it('keeps base units when decimals are unknown', () => {
    expect(
      formatPermitAmount({
        amount: 1_000_000n,
        primaryType: 'PermitSingle',
        decimals: 0,
      })
    ).toBe('1000000')
  })
})
