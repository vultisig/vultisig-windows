import { describe, expect, it } from 'vitest'

import { adjustAmountForFee } from './adjustAmountForFee'

describe('adjustAmountForFee', () => {
  it('adjusts down to balance - fee when only the fee overshoots', () => {
    expect(adjustAmountForFee({ amount: 95n, balance: 100n, fee: 6n })).toBe(
      94n
    )
  })

  it('adjusts a full-balance amount', () => {
    expect(adjustAmountForFee({ amount: 100n, balance: 100n, fee: 6n })).toBe(
      94n
    )
  })

  it('leaves an amount the balance already covers with its fee', () => {
    expect(adjustAmountForFee({ amount: 50n, balance: 100n, fee: 6n })).toBe(
      50n
    )
  })

  it('leaves an amount that overshoots the balance on its own', () => {
    expect(adjustAmountForFee({ amount: 101n, balance: 100n, fee: 6n })).toBe(
      101n
    )
  })

  it('leaves the amount alone when the fee swallows the whole balance', () => {
    expect(adjustAmountForFee({ amount: 50n, balance: 100n, fee: 100n })).toBe(
      50n
    )
  })
})
