import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import {
  LimitSwapTransactionRecord,
  SendTransactionRecord,
  TransactionRecord,
} from '../core'
import { getRecordLastValidBlockHeight } from '../status/getRecordLastValidBlockHeight'
import { normalizeTransactionRecord } from './normalizeTransactionRecord'

const securedUsdc = 'ETH-USDC-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

const order = (
  data: Partial<LimitSwapTransactionRecord['data']> = {}
): LimitSwapTransactionRecord => ({
  id: 'order-1',
  vaultId: 'vault',
  type: 'limitSwap',
  status: 'pending',
  chain: Chain.THORChain,
  timestamp: '2026-08-09T13:39:00.000Z',
  txHash: 'ORDERHASH',
  explorerUrl: '',
  fiatValue: '',
  data: {
    fromAddress: 'rAddress',
    fromToken: 'XRP',
    fromTokenLogo: 'xrp',
    fromChain: Chain.Ripple,
    fromDecimals: 6,
    fromAmount: '200000',
    buyTicker: 'USDC',
    targetAsset: securedUsdc,
    minimumReceived: '0.20841434',
    destinationAddress: 'thor12a9rpf9u2ulwuezxkh6uas4au7xnde8umdua5t',
    memo: `=<:${securedUsdc}:thor12a9rpf9u2ulwuezxkh6uas4au7xnde8umdua5t:20841434/14400/0:v0:50`,
    orderStatus: 'expired',
    ...data,
  },
})

/**
 * A record as it comes back from storage, where `data` is JSON that carries no
 * shape guarantee — the same value `deserializeRecord` hands the normalizer.
 *
 * Round-tripping through JSON reproduces damage rather than simulating it: an
 * `undefined` field is dropped by `JSON.stringify` exactly as it would be on the
 * way in, so the record really does come back without the key.
 */
const fromStorage = (data: unknown): TransactionRecord =>
  JSON.parse(JSON.stringify({ ...order(), data }))

describe('normalizeTransactionRecord', () => {
  // Orders placed before the ticker decode understood secured notation stored
  // the whole denom where the ticker belongs, and it renders on every surface.
  it('re-derives a buy ticker that was stored as the raw denom', () => {
    const record = normalizeTransactionRecord(order({ buyTicker: securedUsdc }))
    if (record.type !== 'limitSwap') {
      throw new Error(`expected a limit swap record, got ${record.type}`)
    }

    expect(record.data.buyTicker).toBe('USDC')
    expect(record.data.targetAsset).toBe(securedUsdc)
  })

  it('leaves a record whose ticker already agrees untouched', () => {
    const record = order()

    expect(normalizeTransactionRecord(record)).toBe(record)
  })

  it('leaves dotted notation alone', () => {
    const record = order({
      buyTicker: 'USDC',
      targetAsset: 'ETH.USDC-06EB48',
    })

    expect(normalizeTransactionRecord(record)).toBe(record)
  })

  // Storage is JSON behind an unchecked cast, so a damaged record must not take
  // the whole history query down with it on its way out.
  it.each([
    ['a missing targetAsset', undefined],
    ['a null targetAsset', null],
    ['an empty targetAsset', ''],
    ['a non-string targetAsset', 42],
  ])(
    'passes a limit record with %s through untouched',
    (_label, targetAsset) => {
      const record = fromStorage({ ...order().data, targetAsset })

      expect(() => normalizeTransactionRecord(record)).not.toThrow()
      expect(normalizeTransactionRecord(record)).toBe(record)
    }
  )

  it('passes non-limit records through untouched', () => {
    const record: SendTransactionRecord = {
      id: 'send-1',
      vaultId: 'vault',
      type: 'send',
      status: 'confirmed',
      chain: Chain.Ripple,
      timestamp: '2026-08-09T13:39:00.000Z',
      txHash: 'SENDHASH',
      explorerUrl: '',
      fiatValue: '',
      data: {
        fromAddress: 'rFrom',
        toAddress: 'rTo',
        amount: '200000',
        decimals: 6,
        token: 'XRP',
        tokenLogo: 'xrp',
      },
    }

    expect(normalizeTransactionRecord(record)).toBe(record)
  })

  // Sends written before the Solana blockhash deadline was carried have no
  // `lastValidBlockHeight`. They must load exactly as they always did and read
  // as having no deadline, so the status poll treats them as it did before.
  it('passes a Solana send from before the deadline was carried through untouched', () => {
    const fromOlderBuild: TransactionRecord = JSON.parse(
      JSON.stringify({
        id: 'send-2',
        vaultId: 'vault',
        type: 'send',
        status: 'pending',
        chain: Chain.Solana,
        timestamp: '2026-08-09T13:39:00.000Z',
        txHash: 'signature',
        explorerUrl: '',
        fiatValue: '',
        data: {
          fromAddress: '7Zb1h3Z4vYtHk1qSQ9HAtpNQJ4T4r1CqWn2zPnyjF4Lt',
          toAddress: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
          amount: '1000000',
          decimals: 9,
          token: 'SOL',
          tokenLogo: 'sol',
        },
      } satisfies SendTransactionRecord)
    )

    expect(normalizeTransactionRecord(fromOlderBuild)).toBe(fromOlderBuild)
    expect(getRecordLastValidBlockHeight(fromOlderBuild)).toBeUndefined()
  })
})
