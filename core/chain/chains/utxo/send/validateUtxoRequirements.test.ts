import { Chain } from '@core/chain/Chain'
import { describe, expect, it } from 'vitest'

import { validateUtxoRequirements } from './validateUtxoRequirements'

describe('validateUtxoRequirements', () => {
  const cardano = Chain.Cardano
  const minAda = 1_400_000n

  it('allows native max send when fee is accounted for (remaining change is zero)', () => {
    const balance = 2_504_877n
    const fee = 180_000n
    const amount = balance - fee

    expect(
      validateUtxoRequirements({
        amount,
        balance,
        chain: cardano,
        fee,
      })
    ).toBeUndefined()
  })

  it('without fee, treats balance minus amount as change (legacy non-fee-coin path)', () => {
    const balance = 2_504_877n
    const fee = 180_000n
    const amount = balance - fee

    expect(
      validateUtxoRequirements({
        amount,
        balance,
        chain: cardano,
      })
    ).toBe(
      `This amount would leave too little change. 💡 Try 'Max' to avoid this issue.`
    )
  })

  it('rejects dust change when fee is set and true change is below min UTXO', () => {
    const balance = 5_000_000n
    const fee = 200_000n
    const amount = 3_500_000n

    expect(
      validateUtxoRequirements({
        amount,
        balance,
        chain: cardano,
        fee,
      })
    ).toBe(
      `This amount would leave too little change. 💡 Try 'Max' to avoid this issue.`
    )
  })

  it('skipDustCheck skips change validation but still enforces minimum send', () => {
    expect(
      validateUtxoRequirements({
        amount: minAda - 1n,
        balance: 10_000_000n,
        chain: cardano,
        skipDustCheck: true,
      })
    ).toMatch(/Minimum send amount is/)

    expect(
      validateUtxoRequirements({
        amount: 2_000_000n,
        balance: 5_000_000n,
        chain: cardano,
        skipDustCheck: true,
      })
    ).toBeUndefined()
  })
})
