import { describe, expect, it } from 'vitest'

import { getSolanaRawTxFallback, parseSolanaTx } from './parser'

type ParseSolanaTxInput = Parameters<typeof parseSolanaTx>[0]

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

describe('parseSolanaTx', () => {
  it('fails with a controlled error when serialized transaction data is missing', async () => {
    await expect(
      parseSolanaTx({
        data: [],
        fromCoin: { address: 'sender' } as ParseSolanaTxInput['fromCoin'],
        getCoin: async () => {
          throw new Error('not expected')
        },
        swapProvider: 'dapp',
        walletCore: {} as ParseSolanaTxInput['walletCore'],
      })
    ).rejects.toThrow(
      'Invalid Solana transaction: missing serialized transaction data'
    )
  })
})
