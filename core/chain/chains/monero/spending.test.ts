import { describe, expect, it } from 'vitest'

import { isSpendableStoredMoneroOutput } from './spending'

describe('monero spending policy', () => {
  it('filters stored outputs above the current chain height', () => {
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

  it('treats locked outputs as unspendable even at the current tip', () => {
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
          locked: true,
        },
        100
      )
    ).toBe(false)
  })
})
