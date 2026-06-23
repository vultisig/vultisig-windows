import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getSerializedSolanaTxBuffer,
  getSolanaMultiTxRawFallback,
  getSolanaRawTxFallback,
} from './rawTxFallback'

const hoisted = vi.hoisted(() => ({
  parseProgramCall: vi.fn(),
  getTxBlockaidSimulation: vi.fn(),
  resolveAddressTableKeys: vi.fn(),
}))

vi.mock('@trustwallet/wallet-core', () => ({
  TW: {
    Solana: {
      Proto: {
        DecodingTransactionOutput: {
          decode: vi.fn(() => ({
            transaction: {
              legacy: {
                accountKeys: [],
              },
            },
          })),
        },
      },
    },
  },
}))

vi.mock('@vultisig/core-chain/chains/solana/client', () => ({
  solanaRpcUrl: 'https://api.devnet.solana.com',
}))

vi.mock('@vultisig/core-chain/security/blockaid/tx/simulation', () => ({
  getTxBlockaidSimulation: (...args: unknown[]) =>
    hoisted.getTxBlockaidSimulation(...args),
}))

vi.mock('./parseProgramCall', () => ({
  parseProgramCall: (...args: unknown[]) => hoisted.parseProgramCall(...args),
}))

vi.mock('./utils', async () => {
  const actual = await vi.importActual<typeof import('./utils')>('./utils')

  return {
    ...actual,
    resolveAddressTableKeys: (...args: unknown[]) =>
      hoisted.resolveAddressTableKeys(...args),
  }
})

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
  beforeEach(() => {
    hoisted.parseProgramCall.mockReset()
    hoisted.getTxBlockaidSimulation.mockReset()
    hoisted.resolveAddressTableKeys.mockReset()
    hoisted.resolveAddressTableKeys.mockResolvedValue([])
    hoisted.getTxBlockaidSimulation.mockRejectedValue(
      new Error('simulation unavailable')
    )
  })

  it('preserves every transaction when parser returns raw fallback for a batch', async () => {
    const first = Buffer.from('raw-tx-1').toString('base64')
    const second = Buffer.from('raw-tx-2').toString('base64')
    hoisted.parseProgramCall.mockResolvedValue(getSolanaRawTxFallback([first]))

    const { parseSolanaTx } = await import('./parser')
    const result = await parseSolanaTx({
      fromCoin: { chain: 'Solana', address: 'from-address' } as any,
      walletCore: {
        CoinType: { solana: 501 },
        TransactionDecoder: {
          decode: vi.fn(() => new Uint8Array([1])),
        },
      } as any,
      data: [first, second],
      getCoin: vi.fn(),
      swapProvider: 'test',
    })

    expect(result).toMatchObject({
      raw: {
        transactions: [first, second],
      },
    })
  })
})

describe('getSerializedSolanaTxBuffer', () => {
  it('fails with a controlled error when serialized transaction data is missing', () => {
    expect(() => getSerializedSolanaTxBuffer([])).toThrow(
      'Invalid Solana transaction: missing serialized transaction data'
    )
  })
})

describe('getSolanaMultiTxRawFallback', () => {
  it('uses raw review for multi-transaction approvals', async () => {
    const transactions = [
      Buffer.from('first-transaction').toString('base64'),
      Buffer.from('second-transaction').toString('base64'),
    ]

    const parsed = getSolanaMultiTxRawFallback(transactions)

    expect(parsed).toMatchObject({
      raw: {
        inAmount: '0',
        inputCoin: { chain: 'Solana' },
        transactions,
      },
    })
  })
})
