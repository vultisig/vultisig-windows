import { describe, expect, it } from 'vitest'

import {
  hasBlockaidEvmChangesForSummary,
  normalizeBlockaidEvmParsed,
} from './blockaidEvmSimulationNormalize'

const eth = {
  decimals: 18,
  ticker: 'ETH',
  chain: 'Ethereum',
} as const

describe('normalizeBlockaidEvmParsed', () => {
  it('returns null for non-objects and null', () => {
    expect(normalizeBlockaidEvmParsed(null)).toBeNull()
    expect(normalizeBlockaidEvmParsed(undefined)).toBeNull()
    expect(normalizeBlockaidEvmParsed('x')).toBeNull()
    expect(normalizeBlockaidEvmParsed(1)).toBeNull()
  })

  it('normalizes SDK-style { changes } with one send leg', () => {
    const parsed = {
      changes: [
        {
          direction: 'send' as const,
          amount: 1n,
          coin: eth,
        },
      ],
    }
    expect(normalizeBlockaidEvmParsed(parsed)).toEqual(parsed)
  })

  it('returns null when changes is empty', () => {
    expect(normalizeBlockaidEvmParsed({ changes: [] })).toBeNull()
  })

  it('returns null when a change entry is invalid', () => {
    expect(
      normalizeBlockaidEvmParsed({
        changes: [{ direction: 'send', amount: 1, coin: eth }],
      })
    ).toBeNull()
  })

  it('normalizes legacy swap', () => {
    const swap = {
      fromCoin: eth,
      fromAmount: 2n,
      toCoin: { ...eth, ticker: 'USDC' },
      toAmount: 100n,
    }
    expect(normalizeBlockaidEvmParsed({ swap })).toEqual({ swap })
  })

  it('normalizes legacy transfer', () => {
    const transfer = { fromCoin: eth, fromAmount: 3n }
    expect(normalizeBlockaidEvmParsed({ transfer })).toEqual({ transfer })
  })
})

describe('hasBlockaidEvmChangesForSummary', () => {
  it('is true for valid changes array', () => {
    const data = {
      changes: [{ direction: 'receive' as const, amount: 1n, coin: eth }],
    }
    expect(hasBlockaidEvmChangesForSummary(data)).toBe(true)
  })

  it('is false when any leg is invalid', () => {
    expect(
      hasBlockaidEvmChangesForSummary({
        changes: [{ direction: 'send', amount: 1, coin: eth }],
      })
    ).toBe(false)
  })
})
