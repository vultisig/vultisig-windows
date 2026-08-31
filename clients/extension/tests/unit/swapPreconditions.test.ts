import { describe, expect, it } from 'vitest'

import {
  type ChainBalance,
  getSwapPreconditionFailure,
} from '../e2e/helpers/dynamic-swap'

type BalanceInput = {
  chainId: string
  balanceUsd: number
  symbol?: string
}

const balance = ({
  chainId,
  balanceUsd,
  symbol = chainId.toUpperCase(),
}: BalanceInput): ChainBalance => ({ chainId, symbol, balance: 1, balanceUsd })

describe('getSwapPreconditionFailure', () => {
  it('passes when one chain clears the default threshold', () => {
    expect(
      getSwapPreconditionFailure([
        balance({ chainId: 'ethereum', balanceUsd: 20 }),
        balance({ chainId: 'bitcoin', balanceUsd: 1 }),
      ])
    ).toBeNull()
  })

  it('names the shortfall and the richest chain when nothing clears it', () => {
    const failure = getSwapPreconditionFailure([
      balance({ chainId: 'solana', balanceUsd: 5.94 }),
      balance({ chainId: 'bitcoin', balanceUsd: 3.38 }),
      balance({ chainId: 'ethereum', balanceUsd: 1.64 }),
    ])

    expect(failure).toContain('$15')
    expect(failure).toContain('solana')
    expect(failure).toContain('5.94')
  })

  it('points at the knob rather than leaving the reader guessing', () => {
    const failure = getSwapPreconditionFailure([
      balance({ chainId: 'solana', balanceUsd: 5.94 }),
      balance({ chainId: 'bitcoin', balanceUsd: 3.38 }),
    ])

    expect(failure).toContain('SWAP_MIN_USD')
  })

  it('reports too few chains separately from too little money', () => {
    expect(
      getSwapPreconditionFailure([
        balance({ chainId: 'ethereum', balanceUsd: 500 }),
      ])
    ).toContain('at least 2 chains')
  })
})
