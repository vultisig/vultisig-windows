import { describe, expect, it } from 'vitest'

import { getSolanaRawTxFallback } from './parser'

describe('getSolanaRawTxFallback', () => {
  it('uses the raw review path instead of synthesizing a blank transfer', () => {
    const fallback = getSolanaRawTxFallback(['raw-tx-1', 'raw-tx-2'])

    expect('transfer' in fallback).toBe(false)
    expect(fallback).toMatchObject({
      raw: {
        inAmount: '0',
        inputCoin: { chain: 'Solana' },
        transactions: ['raw-tx-1', 'raw-tx-2'],
      },
    })
  })
})
