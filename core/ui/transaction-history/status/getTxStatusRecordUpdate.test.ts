import { Chain } from '@vultisig/core-chain/Chain'
import { TxStatusResult } from '@vultisig/core-chain/tx/status/resolver'
import { describe, expect, it } from 'vitest'

import {
  SendTransactionRecord,
  SwapTransactionRecord,
  TransactionRecordStatus,
} from '../core'
import { getTxStatusRecordUpdate } from './getTxStatusRecordUpdate'

// The signature from the report: signed and sent, never seen by the chain.
const droppedSignature =
  'UkuwLmyVyGXt5MVcbJTCYXVjKwKopn8TD8FsvqwcLMRN83zR4x3cvuGN9YjJ8WMvb79wBaAzf1bxSD2aG3bn6xu'

const send = (
  status: TransactionRecordStatus = 'pending'
): SendTransactionRecord => ({
  id: 'send-1',
  vaultId: 'vault',
  type: 'send',
  status,
  chain: Chain.Solana,
  timestamp: '2026-09-20T12:00:00.000Z',
  txHash: droppedSignature,
  explorerUrl: '',
  fiatValue: '',
  data: {
    fromAddress: '7Zb1h3Z4vYtHk1qSQ9HAtpNQJ4T4r1CqWn2zPnyjF4Lt',
    toAddress: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
    amount: '1000000',
    token: 'SOL',
    tokenLogo: 'sol',
    decimals: 9,
    lastValidBlockHeight: 312_456_789,
  },
})

const swap = (
  status: TransactionRecordStatus = 'pending'
): SwapTransactionRecord => ({
  id: 'swap-1',
  vaultId: 'vault',
  type: 'swap',
  status,
  chain: Chain.Solana,
  timestamp: '2026-09-20T12:00:00.000Z',
  txHash: droppedSignature,
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
    provider: 'jupiter',
    lastValidBlockHeight: 312_456_789,
  },
})

const expired: TxStatusResult = { status: 'expired', isKnown: false }
const notFound: TxStatusResult = { status: 'not_found', isKnown: false }
const success: TxStatusResult = { status: 'success' }

describe('getTxStatusRecordUpdate', () => {
  // Past its last valid block height an unseen signature can never land. The
  // chain proved it, so the record is terminal — and the row can say why.
  it('fails an expired send and records that it expired', () => {
    const update = getTxStatusRecordUpdate({ record: send(), result: expired })

    expect(update).toMatchObject({
      type: 'send',
      status: 'failed',
      data: { failureReason: 'expired', lastValidBlockHeight: 312_456_789 },
    })
  })

  it('fails an expired swap and records that it expired', () => {
    const update = getTxStatusRecordUpdate({ record: swap(), result: expired })

    expect(update).toMatchObject({
      type: 'swap',
      status: 'failed',
      data: { failureReason: 'expired', provider: 'jupiter' },
    })
  })

  // A node that has not seen a hash proves nothing on its own — a broadcast
  // can outrun propagation, and the deadline may still be ahead. Only an
  // absence the chain proved permanent, reported as `expired`, is terminal.
  it('keeps a hash the node has not seen inside its validity window pending', () => {
    expect(
      getTxStatusRecordUpdate({ record: send('broadcasted'), result: notFound })
    ).toMatchObject({ status: 'pending' })

    expect(
      getTxStatusRecordUpdate({ record: send('pending'), result: notFound })
    ).toBeNull()
  })

  it('does not explain a failure the chain gave no reason for', () => {
    const update = getTxStatusRecordUpdate({
      record: send(),
      result: { status: 'error', isKnown: true },
    })

    expect(update?.status).toBe('failed')
    expect(update?.data).not.toHaveProperty('failureReason')
  })

  it('confirms a transaction the chain executed', () => {
    expect(
      getTxStatusRecordUpdate({ record: send('broadcasted'), result: success })
    ).toMatchObject({ status: 'confirmed' })
  })

  it('returns null when the verdict matches the stored status', () => {
    expect(
      getTxStatusRecordUpdate({
        record: send('pending'),
        result: { status: 'pending', isKnown: true },
      })
    ).toBeNull()
  })

  describe('a record already stored as failed', () => {
    it('heals to confirmed once the chain reports success', () => {
      expect(
        getTxStatusRecordUpdate({ record: send('failed'), result: success })
      ).toMatchObject({ status: 'confirmed' })
    })

    it('revives to pending on an affirmative in-flight sighting', () => {
      expect(
        getTxStatusRecordUpdate({
          record: send('failed'),
          result: { status: 'pending', isKnown: true },
        })
      ).toMatchObject({ status: 'pending' })
    })

    it.each<[string, TxStatusResult]>([
      ['an expiry', expired],
      ['an unseen hash', notFound],
      ['an inconclusive pending', { status: 'pending', isKnown: false }],
    ])('is left alone by %s', (_label, result) => {
      expect(
        getTxStatusRecordUpdate({ record: send('failed'), result })
      ).toBeNull()
    })
  })
})
