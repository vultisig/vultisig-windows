import { Chain } from '@vultisig/core-chain/Chain'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  SendTransactionRecord,
  SwapTransactionRecord,
  TransactionRecordStatus,
} from '../core'
import { getTxStatusRecordUpdate } from './getTxStatusRecordUpdate'
import { getStatusPollingInterval } from './staleTransaction'

const staleTimestamp = () => new Date(Date.now() - 6 * 60 * 1000).toISOString()

const freshTimestamp = () => new Date(Date.now() - 60 * 1000).toISOString()

const agedTimestamp = () =>
  new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()

const baseRecord = {
  id: 'record-1',
  vaultId: 'vault-1',
  chain: Chain.THORChain,
  txHash: 'ABC123',
  explorerUrl: 'https://runescan.io/tx/ABC123',
  fiatValue: '',
} as const

type RecordInput = {
  timestamp: string
  status?: TransactionRecordStatus
}

const sendRecord = ({
  timestamp,
  status = 'pending',
}: RecordInput): SendTransactionRecord => ({
  ...baseRecord,
  type: 'send',
  status,
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

const swapRecord = ({
  timestamp,
  status = 'pending',
}: RecordInput): SwapTransactionRecord => ({
  ...baseRecord,
  type: 'swap',
  status,
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

describe('getTxStatusRecordUpdate', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('confirms a stale pending send once the chain reports success', () => {
    vi.setSystemTime(new Date('2026-06-25T18:00:00Z'))

    const update = getTxStatusRecordUpdate({
      record: sendRecord({ timestamp: staleTimestamp() }),
      result: { status: 'success' },
    })

    expect(update?.status).toBe('confirmed')
  })

  it('keeps a stale pending send pending while the chain still reports pending', () => {
    vi.setSystemTime(new Date('2026-06-25T18:00:00Z'))

    const update = getTxStatusRecordUpdate({
      record: sendRecord({ timestamp: staleTimestamp() }),
      result: { status: 'pending', isKnown: true },
    })

    expect(update).toBeNull()
  })

  it('keeps a stale pending send pending when the node has not seen the hash', () => {
    vi.setSystemTime(new Date('2026-06-25T18:00:00Z'))

    const update = getTxStatusRecordUpdate({
      record: sendRecord({ timestamp: staleTimestamp() }),
      result: { status: 'not_found', isKnown: false },
    })

    expect(update).toBeNull()
  })

  it('fails a pending send only on an authoritative chain failure', () => {
    vi.setSystemTime(new Date('2026-06-25T18:00:00Z'))

    const update = getTxStatusRecordUpdate({
      record: sendRecord({ timestamp: staleTimestamp() }),
      result: { status: 'error' },
    })

    expect(update?.status).toBe('failed')
  })

  it('fails a pending send when the SDK proves protocol expiration', () => {
    const update = getTxStatusRecordUpdate({
      record: sendRecord({ timestamp: freshTimestamp() }),
      result: { status: 'expired', isKnown: true },
    })

    expect(update?.status).toBe('failed')
  })

  it('keeps an already failed send failed on protocol expiration', () => {
    const update = getTxStatusRecordUpdate({
      record: sendRecord({ timestamp: freshTimestamp(), status: 'failed' }),
      result: { status: 'expired', isKnown: true },
    })

    expect(update).toBeNull()
  })

  it('keeps stale pending swaps pending until an authoritative status resolves them', () => {
    vi.setSystemTime(new Date('2026-06-25T18:00:00Z'))

    const update = getTxStatusRecordUpdate({
      record: swapRecord({ timestamp: staleTimestamp() }),
      result: { status: 'pending', isKnown: true },
    })

    expect(update).toBeNull()
  })

  it('heals a failed send to confirmed when the chain reports success', () => {
    vi.setSystemTime(new Date('2026-06-25T18:00:00Z'))

    const update = getTxStatusRecordUpdate({
      record: sendRecord({ timestamp: staleTimestamp(), status: 'failed' }),
      result: { status: 'success' },
    })

    expect(update?.status).toBe('confirmed')
  })

  it('revives a failed send to pending when the node reports it in-flight', () => {
    vi.setSystemTime(new Date('2026-06-25T18:00:00Z'))

    const update = getTxStatusRecordUpdate({
      record: sendRecord({ timestamp: staleTimestamp(), status: 'failed' }),
      result: { status: 'pending', isKnown: true },
    })

    expect(update?.status).toBe('pending')
  })

  it('leaves a failed send failed when the status lookup is inconclusive', () => {
    vi.setSystemTime(new Date('2026-06-25T18:00:00Z'))

    const update = getTxStatusRecordUpdate({
      record: sendRecord({ timestamp: staleTimestamp(), status: 'failed' }),
      result: { status: 'pending', isKnown: false },
    })

    expect(update).toBeNull()
  })

  it('leaves a failed send failed when the node has no record of the hash', () => {
    vi.setSystemTime(new Date('2026-06-25T18:00:00Z'))

    const update = getTxStatusRecordUpdate({
      record: sendRecord({ timestamp: staleTimestamp(), status: 'failed' }),
      result: { status: 'not_found', isKnown: false },
    })

    expect(update).toBeNull()
  })
})

describe('getStatusPollingInterval', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('polls fresh pending records every few seconds', () => {
    vi.setSystemTime(new Date('2026-06-25T18:00:00Z'))

    expect(
      getStatusPollingInterval(sendRecord({ timestamp: freshTimestamp() }))
    ).toBe(3000)
  })

  it('backs off polling for stale pending records instead of failing them', () => {
    vi.setSystemTime(new Date('2026-06-25T18:00:00Z'))

    expect(
      getStatusPollingInterval(sendRecord({ timestamp: staleTimestamp() }))
    ).toBe(30000)
  })

  // A dropped transaction never leaves `pending`, and the app-wide watcher
  // would otherwise ask the chain about it every half minute for good.
  it('slows to minutes for pending records older than a day', () => {
    vi.setSystemTime(new Date('2026-06-25T18:00:00Z'))

    expect(
      getStatusPollingInterval(sendRecord({ timestamp: agedTimestamp() }))
    ).toBe(600000)
  })
})
