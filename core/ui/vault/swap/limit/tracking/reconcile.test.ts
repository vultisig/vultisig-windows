import { Chain } from '@vultisig/core-chain/Chain'
import { LimitSwapQueueEntry } from '@vultisig/core-chain/swap/native/limitSwapQueue'
import { describe, expect, it } from 'vitest'

import { LimitSwapTransactionRecord } from '../../../../transaction-history/core'
import {
  findLimitOrderQueueEntry,
  getLimitOrderCloseUpdate,
  getLimitOrderRejectionUpdate,
  getLimitOrderRestingUpdate,
  isLiveLimitOrderStatus,
} from './reconcile'

const txHash =
  '5CB3698C77FC719202EB1AEE5C5060B12A86E0BC086B0BB0DCC176711640F9C3'

const record: LimitSwapTransactionRecord = {
  id: `${txHash}-t`,
  vaultId: 'vault',
  type: 'limitSwap',
  status: 'broadcasted',
  chain: Chain.THORChain,
  timestamp: '2026-07-30T00:00:00.000Z',
  txHash,
  explorerUrl: '',
  fiatValue: '',
  data: {
    fromAddress: 'thor1sender',
    fromToken: 'RUNE',
    fromTokenLogo: 'rune',
    fromChain: Chain.THORChain,
    fromDecimals: 8,
    fromAmount: '100000000',
    buyTicker: 'USDC',
    targetAsset: 'ETH.USDC-06EB48',
    minimumReceived: '0.43079145',
    destinationAddress: '0x14F6Ed6CBb27b607b0E2A48551A988F1a19c89B6',
    expiryHours: 24,
    memo: '=<:ETH.USDC-06EB48:0x14F6Ed6CBb27b607b0E2A48551A988F1a19c89B6:43079145/14400/0:v0:50',
    orderStatus: 'pending',
  },
}

const entry: LimitSwapQueueEntry = {
  txId: txHash,
  failedSwapReasons: [],
  deposit: 100_000_000n,
  amountIn: 25_000_000n,
  amountOut: 10_769_786n,
  timeToExpiryBlocks: 13_056,
}

describe('findLimitOrderQueueEntry', () => {
  // The queue's casing needn't match the hash we broadcast under, and EVM
  // sources broadcast 0x-prefixed lowercase.
  it('matches case-insensitively and ignores a 0x prefix', () => {
    expect(
      findLimitOrderQueueEntry({
        entries: [entry],
        txHash: `0x${txHash.toLowerCase()}`,
      })
    ).toBe(entry)
  })

  it('returns undefined when the order is not in the queue', () => {
    expect(findLimitOrderQueueEntry({ entries: [], txHash })).toBeUndefined()
  })
})

describe('getLimitOrderRestingUpdate', () => {
  it('marks the order resting with the queue observation', () => {
    const updated = getLimitOrderRestingUpdate({ record, entry })

    expect(updated?.data.orderStatus).toBe('resting')
    expect(updated?.status).toBe('pending')
    expect(updated?.data.amountIn).toBe('25000000')
    expect(updated?.data.amountOut).toBe('10769786')
    expect(updated?.data.timeToExpiryBlocks).toBe(13_056)
  })

  // A quiet order must not rewrite storage every poll.
  it('returns null when nothing changed', () => {
    const settled = getLimitOrderRestingUpdate({ record, entry })
    expect(settled).not.toBeNull()

    expect(getLimitOrderRestingUpdate({ record: settled!, entry })).toBeNull()
  })

  it('keeps the previous observation for fields the entry omits', () => {
    const seen = getLimitOrderRestingUpdate({ record, entry })!
    const sparse: LimitSwapQueueEntry = { txId: txHash, failedSwapReasons: [] }

    const updated = getLimitOrderRestingUpdate({ record: seen, entry: sparse })

    expect(updated).toBeNull()
  })

  // The queue is the only place an order's identity can be read back as
  // THORChain holds it — the placement memo abbreviates an L1 contract, and a
  // cancel memo skips the fuzzy matching that would expand it. Without these
  // stored, a token order can never be cancelled.
  it("copies across the queue's own spelling of the order identity", () => {
    const observed: LimitSwapQueueEntry = {
      ...entry,
      sourceAsset: 'THOR.RUNE',
      targetAsset: 'ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48',
      tradeTarget: 43_079_145n,
    }

    const updated = getLimitOrderRestingUpdate({ record, entry: observed })

    expect(updated?.data).toMatchObject({
      observedSourceAsset: 'THOR.RUNE',
      observedTargetAsset:
        'ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48',
      observedTradeTarget: '43079145',
    })
  })

  it('rewrites storage when only the observed identity arrives', () => {
    const seen = getLimitOrderRestingUpdate({ record, entry })!

    const updated = getLimitOrderRestingUpdate({
      record: seen,
      entry: { ...entry, targetAsset: 'ETH.USDC-0XA0B8' },
    })

    expect(updated?.data.observedTargetAsset).toBe('ETH.USDC-0XA0B8')
  })
})

describe('getLimitOrderCloseUpdate', () => {
  it.each([
    ['filled', 'confirmed'],
    ['expired', 'confirmed'],
    ['refunded', 'confirmed'],
    ['cancelled', 'confirmed'],
  ] as const)('closes as %s with record status %s', (outcome, status) => {
    const updated = getLimitOrderCloseUpdate({ record, outcome })

    expect(updated?.data.orderStatus).toBe(outcome)
    expect(updated?.status).toBe(status)
  })

  // A guess would be permanent: nothing revisits a terminal order.
  it('writes nothing on unresolved', () => {
    expect(
      getLimitOrderCloseUpdate({ record, outcome: 'unresolved' })
    ).toBeNull()
  })

  // A TTL-expiry settle can follow a real partial fill; dropping the split
  // would hide that the user received something.
  it('retains the last-seen fill split on close', () => {
    const resting = getLimitOrderRestingUpdate({ record, entry })!
    const closed = getLimitOrderCloseUpdate({
      record: resting,
      outcome: 'expired',
    })

    expect(closed?.data.amountOut).toBe('10769786')
    expect(closed?.data.deposit).toBe('100000000')
  })
})

describe('getLimitOrderRejectionUpdate', () => {
  it('marks a refused deposit rejected and failed', () => {
    const updated = getLimitOrderRejectionUpdate({
      record,
      txResult: { code: 5, rawLog: 'invalid memo' },
    })

    expect(updated?.data.orderStatus).toBe('rejected')
    expect(updated?.status).toBe('failed')
  })

  // null is "no information" — not yet indexed, node unreachable.
  it.each([
    ['an unavailable result', null],
    ['an accepted deposit', { code: 0, rawLog: '' }],
  ])('writes nothing for %s', (_label, txResult) => {
    expect(getLimitOrderRejectionUpdate({ record, txResult })).toBeNull()
  })
})

describe('isLiveLimitOrderStatus', () => {
  it('splits live from terminal statuses', () => {
    expect(isLiveLimitOrderStatus('pending')).toBe(true)
    expect(isLiveLimitOrderStatus('resting')).toBe(true)
    expect(isLiveLimitOrderStatus('filled')).toBe(false)
    expect(isLiveLimitOrderStatus('rejected')).toBe(false)
  })
})
