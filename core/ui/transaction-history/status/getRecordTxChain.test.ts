import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { SwapTransactionRecord, TransactionRecord } from '../core'
import { getRecordTxChain } from './getRecordTxChain'

const base = {
  id: 'record-1',
  vaultId: 'vault-1',
  timestamp: new Date().toISOString(),
  txHash: '0xhash',
  explorerUrl: '',
  fiatValue: '',
  status: 'pending' as const,
}

const swapData: SwapTransactionRecord['data'] = {
  fromToken: 'ETH',
  fromAmount: '1',
  fromChain: Chain.Ethereum,
  fromDecimals: 18,
  fromTokenLogo: '',
  toToken: 'BTC',
  toAmount: '0.05',
  toDecimals: 8,
  toTokenLogo: '',
  toChain: Chain.Bitcoin,
}

describe('getRecordTxChain', () => {
  it('reads a native swap filed under THORChain on the chain it was signed on', () => {
    const record: TransactionRecord = {
      ...base,
      type: 'swap',
      chain: Chain.THORChain,
      data: swapData,
    }

    expect(getRecordTxChain(record)).toBe(Chain.Ethereum)
  })

  it('keeps a THORChain-originated swap on THORChain', () => {
    const record: TransactionRecord = {
      ...base,
      type: 'swap',
      chain: Chain.THORChain,
      data: { ...swapData, fromToken: 'RUNE', fromChain: Chain.THORChain },
    }

    expect(getRecordTxChain(record)).toBe(Chain.THORChain)
  })

  it("reads a send on the record's own chain", () => {
    const record: TransactionRecord = {
      ...base,
      type: 'send',
      chain: Chain.Bitcoin,
      data: {
        fromAddress: 'bc1from',
        toAddress: 'bc1to',
        amount: '1',
        token: 'BTC',
        tokenLogo: '',
        decimals: 8,
      },
    }

    expect(getRecordTxChain(record)).toBe(Chain.Bitcoin)
  })
})
