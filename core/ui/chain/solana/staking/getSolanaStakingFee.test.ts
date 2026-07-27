import { solanaConfig } from '@vultisig/core-chain/chains/solana/solanaConfig'
import { describe, expect, it } from 'vitest'

import {
  getSolanaStakingFee,
  solanaStakingFloorFee,
} from './getSolanaStakingFee'

describe('getSolanaStakingFee', () => {
  it('adds the prioritization fee to the per-signature base fee', () => {
    // 1_000_000 µ-lamports/CU × 100_000 CU = 100_000 lamports.
    expect(
      getSolanaStakingFee({
        priorityFeePrice: 1_000_000n,
        priorityFeeLimit: 100_000,
      })
    ).toBe(BigInt(solanaConfig.baseFee) + 100_000n)
  })

  it('rounds the prioritization fee up, like the runtime does', () => {
    expect(
      getSolanaStakingFee({ priorityFeePrice: 1n, priorityFeeLimit: 1 })
    ).toBe(BigInt(solanaConfig.baseFee) + 1n)
  })

  it('falls back to the base fee when no priority fee is charged', () => {
    expect(
      getSolanaStakingFee({ priorityFeePrice: 0n, priorityFeeLimit: 100_000 })
    ).toBe(BigInt(solanaConfig.baseFee))
  })

  it('exposes the floor fee the delegate form budgets with', () => {
    expect(solanaStakingFloorFee).toBe(
      getSolanaStakingFee({
        priorityFeePrice: BigInt(solanaConfig.priorityFeePrice),
        priorityFeeLimit: solanaConfig.priorityFeeLimit,
      })
    )
    // Reserving only `baseFee` leaves a max-sized stake short by the
    // prioritization fee — the regression this constant closes.
    expect(solanaStakingFloorFee).toBeGreaterThan(BigInt(solanaConfig.baseFee))
  })
})
