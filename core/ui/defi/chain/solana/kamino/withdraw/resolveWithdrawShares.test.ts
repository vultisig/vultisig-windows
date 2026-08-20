import {
  kaminoShareAmount,
  kaminoTokenAmount,
} from '@vultisig/core-chain/chains/solana/kamino/amount'
import { parseKaminoRate } from '@vultisig/core-chain/chains/solana/kamino/rate'
import { describe, expect, it } from 'vitest'

import { resolveWithdrawShares } from './resolveWithdrawShares'

const tokensPerShare = parseKaminoRate('1.0536041812651029025')!

const position = {
  staked: kaminoShareAmount(900_000n, 6),
  unstaked: kaminoShareAmount(100_000n, 6),
  total: kaminoShareAmount(1_000_000n, 6),
  spendable: kaminoShareAmount(999_999n, 6),
  accountsForItsTotal: true,
  isPlausible: true,
}

const resolve = (tokenAmount: number, isMax = false) =>
  resolveWithdrawShares({
    tokenAmount,
    tokenDecimals: 6,
    tokensPerShare,
    position,
    isMax,
  })

describe('resolveWithdrawShares', () => {
  it('sends the held balance itself for a max withdraw', () => {
    // Never a share count derived from a token figure: the derivation
    // truncates and would strand dust, and rounding the other way asks for
    // more than the position holds.
    expect(resolve(0, true)).toBe(position.spendable)
  })

  it('converts a typed amount through exact integer arithmetic', () => {
    // 1 USDC at a rate above parity is less than 1 share.
    expect(resolve(1)?.baseUnits).toBe(949_123n)
  })

  it('never asks for more than the position can spend', () => {
    // The rate moves between the read and the keystroke, so a typed amount can
    // outrun the balance — and over-asking is what Kamino turns into a full exit.
    expect(resolve(1_000_000)?.baseUnits).toBe(position.spendable.baseUnits)
  })

  it('stays strictly below the reported total, so the sentinel is unreachable', () => {
    const shares = resolve(0, true)
    expect(shares!.baseUnits).toBeLessThan(position.total.baseUnits)
  })

  it('refuses an amount it cannot convert', () => {
    const zeroRate = parseKaminoRate('0')!
    expect(
      resolveWithdrawShares({
        tokenAmount: 1,
        tokenDecimals: 6,
        tokensPerShare: zeroRate,
        position,
        isMax: false,
      })
    ).toBeUndefined()
  })
})

// A token amount is what the holder types; shares are what the chain burns.
// Pinned so a refactor cannot quietly swap the units.
describe('unit discipline', () => {
  it('returns shares, not tokens', () => {
    expect(resolve(1)?.unit).toBe('kaminoShare')
    expect(kaminoTokenAmount(1n, 6).unit).toBe('kaminoToken')
  })
})
