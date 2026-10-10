import { describe, expect, it } from 'vitest'

import { isUnlimitedPermitAmount } from './isUnlimitedPermitAmount'

const maxUint256 = 2n ** 256n - 1n
const maxUint160 = 2n ** 160n - 1n

const permitPrimaryTypes = [
  'Permit',
  'PermitSingle',
  'PermitBatch',
  'PermitTransferFrom',
  'PermitBatchTransferFrom',
]

describe('isUnlimitedPermitAmount', () => {
  it('treats the uint256 max as unlimited for every permit type', () => {
    for (const primaryType of permitPrimaryTypes) {
      expect(isUnlimitedPermitAmount({ amount: maxUint256, primaryType })).toBe(
        true
      )
    }
  })

  it('treats the uint160 max as unlimited for Permit2 allowances', () => {
    for (const primaryType of ['PermitSingle', 'PermitBatch']) {
      expect(isUnlimitedPermitAmount({ amount: maxUint160, primaryType })).toBe(
        true
      )
    }
  })

  it('keeps the uint160 max finite for uint256 permits', () => {
    for (const primaryType of ['Permit', 'PermitTransferFrom']) {
      expect(isUnlimitedPermitAmount({ amount: maxUint160, primaryType })).toBe(
        false
      )
    }
  })

  it('keeps a finite amount finite', () => {
    expect(
      isUnlimitedPermitAmount({
        amount: 1_000_000n,
        primaryType: 'PermitSingle',
      })
    ).toBe(false)
  })
})
