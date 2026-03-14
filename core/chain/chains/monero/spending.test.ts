import { describe, expect, it } from 'vitest'

import {
  getMoneroSafeScanHeight,
  isSpendableStoredMoneroOutput,
} from './spending'

describe('monero spending policy', () => {
  it('scans to chain tip minus 10 blocks', () => {
    expect(getMoneroSafeScanHeight(100)).toBe(90)
    expect(getMoneroSafeScanHeight(7)).toBe(0)
  })

  it('filters stored outputs above the safe scan height', () => {
    expect(
      isSpendableStoredMoneroOutput(
        {
          amount: '5',
          keyOffsetHex: '01',
          outputKeyHex: 'aa',
          commitmentMaskHex: '11',
          globalIndex: '1',
          height: 90,
          spent: false,
        },
        90
      )
    ).toBe(true)

    expect(
      isSpendableStoredMoneroOutput(
        {
          amount: '7',
          keyOffsetHex: '02',
          outputKeyHex: 'bb',
          commitmentMaskHex: '22',
          globalIndex: '2',
          height: 91,
          spent: false,
        },
        90
      )
    ).toBe(false)
  })
})
