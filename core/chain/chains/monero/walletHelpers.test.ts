import { describe, expect, it } from 'vitest'

import {
  getSpendableBalanceFromMoneroOutputs,
  isSpendableMoneroOutput,
  networkName,
} from './walletHelpers'

const createOutput = ({
  amount,
  isSpent,
  isFrozen,
  isLocked,
}: {
  amount: bigint | number | string
  isSpent?: boolean
  isFrozen?: boolean
  isLocked?: boolean
}) => ({
  getAmount: () => amount,
  getIsSpent: () => isSpent,
  getIsFrozen: () => isFrozen,
  getIsLocked: () => isLocked,
})

describe('networkName', () => {
  it('matches frost-zm network ids', () => {
    expect(networkName(0)).toBe('mainnet')
    expect(networkName(1)).toBe('testnet')
    expect(networkName(2)).toBe('stagenet')
  })
})

describe('isSpendableMoneroOutput', () => {
  it('rejects spent, frozen, and locked outputs', () => {
    expect(isSpendableMoneroOutput(createOutput({ amount: 1n }))).toBe(true)
    expect(
      isSpendableMoneroOutput(createOutput({ amount: 1n, isSpent: true }))
    ).toBe(false)
    expect(
      isSpendableMoneroOutput(createOutput({ amount: 1n, isFrozen: true }))
    ).toBe(false)
    expect(
      isSpendableMoneroOutput(createOutput({ amount: 1n, isLocked: true }))
    ).toBe(false)
  })
})

describe('getSpendableBalanceFromMoneroOutputs', () => {
  it('sums only spendable outputs', () => {
    const balance = getSpendableBalanceFromMoneroOutputs([
      createOutput({ amount: 5n }),
      createOutput({ amount: '7' }),
      createOutput({ amount: 11n, isSpent: true }),
      createOutput({ amount: 13n, isFrozen: true }),
      createOutput({ amount: 17n, isLocked: true }),
    ])

    expect(balance).toBe(12n)
  })
})
