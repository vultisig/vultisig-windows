import { Chain } from '@vultisig/core-chain/Chain'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SendTransactionRecord, SwapTransactionRecord } from '../core'
import { shouldFailStaleTransaction } from './staleTransaction'

const staleTimestamp = () => new Date(Date.now() - 6 * 60 * 1000).toISOString()

const freshTimestamp = () => new Date(Date.now() - 60 * 1000).toISOString()

const baseRecord = {
  id: 'record-1',
  vaultId: 'vault-1',
  status: 'pending',
  chain: Chain.THORChain,
  txHash: 'ABC123',
  explorerUrl: 'https://runescan.io/tx/ABC123',
  fiatValue: '',
} as const

const sendRecord = (timestamp: string): SendTransactionRecord => ({
  ...baseRecord,
  type: 'send',
  timestamp,
  data: {
    fromAddress: 'thor1from',
    toAddress: 'thor1to',
    amount: '100000000',
    token: 'RUNE',
    tokenLogo: '',
    decimals: 8,
  },
})

const swapRecord = (timestamp: string): SwapTransactionRecord => ({
  ...baseRecord,
  type: 'swap',
  timestamp,
  data: {
    fromToken: 'RUNE',
    fromAmount: '100000000',
    fromChain: Chain.THORChain,
    fromTokenLogo: '',
    fromDecimals: 8,
    toToken: 'BTC',
    toAmount: '0.001',
    toChain: Chain.Bitcoin,
    toTokenLogo: '',
    toDecimals: 8,
    provider: 'THORChain',
    route: 'RUNE -> BTC',
  },
})

describe('shouldFailStaleTransaction', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('fails stale pending sends', () => {
    vi.setSystemTime(new Date('2026-06-25T18:00:00Z'))

    expect(shouldFailStaleTransaction(sendRecord(staleTimestamp()))).toBe(true)
  })

  it('keeps fresh pending sends pending', () => {
    vi.setSystemTime(new Date('2026-06-25T18:00:00Z'))

    expect(shouldFailStaleTransaction(sendRecord(freshTimestamp()))).toBe(false)
  })

  it('keeps stale swaps pending until an authoritative status fails them', () => {
    vi.setSystemTime(new Date('2026-06-25T18:00:00Z'))

    expect(shouldFailStaleTransaction(swapRecord(staleTimestamp()))).toBe(false)
  })
})
