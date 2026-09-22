import { Chain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SendTransactionRecord, SwapTransactionRecord } from '../core'
import { getRecordLastValidBlockHeight } from '../status/getRecordLastValidBlockHeight'
import { withSolanaDeadline } from './withSolanaDeadline'

const getLatestBlockhash = vi.fn()

vi.mock('@vultisig/core-chain/chains/solana/client', () => ({
  getSolanaClient: () => ({ getLatestBlockhash }),
}))

const newestDeadline = 312_456_789

const send = (
  data: Partial<SendTransactionRecord['data']> = {},
  chain: Chain = Chain.Solana
): SendTransactionRecord => ({
  id: 'send-1',
  vaultId: 'vault',
  type: 'send',
  status: 'broadcasted',
  chain,
  timestamp: '2026-09-20T12:00:00.000Z',
  txHash: 'signature',
  explorerUrl: '',
  fiatValue: '',
  data: {
    fromAddress: '7Zb1h3Z4vYtHk1qSQ9HAtpNQJ4T4r1CqWn2zPnyjF4Lt',
    toAddress: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
    amount: '1000000',
    token: 'SOL',
    tokenLogo: 'sol',
    decimals: 9,
    ...data,
  },
})

const swap = (): SwapTransactionRecord => ({
  id: 'swap-1',
  vaultId: 'vault',
  type: 'swap',
  status: 'broadcasted',
  chain: Chain.Solana,
  timestamp: '2026-09-20T12:00:00.000Z',
  txHash: 'signature',
  explorerUrl: '',
  fiatValue: '',
  data: {
    fromToken: 'SOL',
    fromAmount: '1000000000',
    fromChain: Chain.Solana,
    fromTokenLogo: 'sol',
    fromDecimals: 9,
    toToken: 'USDC',
    toAmount: '150',
    toChain: Chain.Solana,
    toTokenLogo: 'usdc',
    toDecimals: 6,
  },
})

describe('withSolanaDeadline', () => {
  beforeEach(() => {
    getLatestBlockhash.mockReset()
    getLatestBlockhash.mockResolvedValue({
      blockhash: 'newest',
      lastValidBlockHeight: newestDeadline,
    })
  })

  // A payload built on a phone, or around Kamino's own transaction, carries
  // no deadline. The newest blockhash's deadline is at or past the signed
  // one's, so the poll can settle on it without ever calling an expiry early.
  it('bounds a Solana send that arrived without a deadline by the newest blockhash', async () => {
    const record = send()

    const bounded = await withSolanaDeadline(record)

    expect(getRecordLastValidBlockHeight(bounded)).toBe(newestDeadline)
    expect(bounded).toMatchObject({ type: 'send', data: record.data })
    expect(getLatestBlockhash).toHaveBeenCalledWith('confirmed')
    // The record handed in is not mutated on its way to storage.
    expect(record.data).not.toHaveProperty('lastValidBlockHeight')
  })

  it('bounds a Solana swap the same way', async () => {
    const bounded = await withSolanaDeadline(swap())

    expect(bounded.type).toBe('swap')
    expect(getRecordLastValidBlockHeight(bounded)).toBe(newestDeadline)
  })

  // The payload's own deadline is exact; a fresh bound could only loosen it.
  it('leaves a record that already carries its deadline alone', async () => {
    const record = send({ lastValidBlockHeight: 300_000_000 })

    expect(await withSolanaDeadline(record)).toBe(record)
    expect(getLatestBlockhash).not.toHaveBeenCalled()
  })

  it('leaves a record on another chain alone', async () => {
    const record = send({}, Chain.Ethereum)

    expect(await withSolanaDeadline(record)).toBe(record)
    expect(getLatestBlockhash).not.toHaveBeenCalled()
  })

  // Recording the transaction matters more than bounding it: a chain that will
  // not answer leaves the record exactly as every build before wrote it.
  it('leaves the record without a deadline when the chain does not answer', async () => {
    getLatestBlockhash.mockRejectedValue(new Error('429 Too Many Requests'))
    const record = send()

    expect(await withSolanaDeadline(record)).toBe(record)
  })
})
