import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { LimitSwapTransactionRecord, SendTransactionRecord } from '../core'
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

describe('normalizeTransactionRecord', () => {
  // Orders placed before the ticker decode understood secured notation stored
  // the whole denom where the ticker belongs, and it renders on every surface.
  it('re-derives a buy ticker that was stored as the raw denom', () => {
    const record = normalizeTransactionRecord(
      order({ buyTicker: securedUsdc })
    ) as LimitSwapTransactionRecord

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
})
