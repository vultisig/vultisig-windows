import { getMaxSendableAmount } from '@vultisig/core-chain/amount/getMaxSendableAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { adjustAmountForFee } from './adjustAmountForFee'

type AdjustInput = {
  chain?: Chain
  amount: bigint
  balance: bigint
  fee: bigint
  allowDeath?: boolean
}

const adjust = ({
  chain = Chain.Ethereum,
  amount,
  balance,
  fee,
  allowDeath,
}: AdjustInput) =>
  adjustAmountForFee({
    amount,
    balance,
    maxSendable: getMaxSendableAmount({ chain, balance, fee, allowDeath }),
  })

describe('adjustAmountForFee', () => {
  it('adjusts down to balance - fee when only the fee overshoots', () => {
    expect(adjust({ amount: 95n, balance: 100n, fee: 6n })).toBe(94n)
  })

  it('adjusts a full-balance amount', () => {
    expect(adjust({ amount: 100n, balance: 100n, fee: 6n })).toBe(94n)
  })

  it('leaves an amount the balance already covers with its fee', () => {
    expect(adjust({ amount: 50n, balance: 100n, fee: 6n })).toBe(50n)
  })

  it('leaves an amount that overshoots the balance on its own', () => {
    expect(adjust({ amount: 101n, balance: 100n, fee: 6n })).toBe(101n)
  })

  it('leaves the amount alone when the fee swallows the whole balance', () => {
    expect(adjust({ amount: 50n, balance: 100n, fee: 100n })).toBe(50n)
  })

  // A keep-alive TAO transfer is refused on-chain if it would leave the sender
  // under the 500 rao existential deposit, so the amount the form commits — and
  // the verify screen shows — has to keep that back on top of the fee, exactly
  // as the keysign payload will sign it.
  describe('on Bittensor', () => {
    const balance = 1_000_000_000n
    const fee = 200_000n

    it('keeps the existential deposit back from a full-balance amount', () => {
      expect(
        adjust({
          chain: Chain.Bittensor,
          amount: balance,
          balance,
          fee,
        })
      ).toBe(balance - fee - 500n)
    })

    it('adjusts an amount that only leaves the fee, not the deposit', () => {
      expect(
        adjust({
          chain: Chain.Bittensor,
          amount: balance - fee,
          balance,
          fee,
        })
      ).toBe(balance - fee - 500n)
    })

    it('leaves an amount that already keeps the deposit', () => {
      const amount = balance - fee - 500n
      expect(adjust({ chain: Chain.Bittensor, amount, balance, fee })).toBe(
        amount
      )
    })

    it('keeps nothing back when the send empties the account', () => {
      expect(
        adjust({
          chain: Chain.Bittensor,
          amount: balance,
          balance,
          fee,
          allowDeath: true,
        })
      ).toBe(balance - fee)
    })

    it('leaves a whole-balance-less-fee amount alone when emptying', () => {
      const amount = balance - fee
      expect(
        adjust({
          chain: Chain.Bittensor,
          amount,
          balance,
          fee,
          allowDeath: true,
        })
      ).toBe(amount)
    })
  })
})
