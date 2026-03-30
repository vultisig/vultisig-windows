import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import {
  SendTransactionRecord,
  SwapTransactionRecord,
  TransactionRecord,
} from '../core'
import { filterTransactionsBySearch } from './filterTransactionsBySearch'

const makeSendRecord = (id: string, token: string): SendTransactionRecord => ({
  id,
  vaultId: 'vault-1',
  type: 'send',
  status: 'confirmed',
  chain: 'Ethereum' as Chain,
  timestamp: '2026-03-11T10:00:00Z',
  txHash: `0x${id}`,
  explorerUrl: `https://etherscan.io/tx/0x${id}`,
  fiatValue: '100',
  data: {
    fromAddress: '0x1',
    toAddress: '0x2',
    amount: '1.5',
    token,
    tokenLogo: '',
    decimals: 18,
  },
})

const makeSwapRecord = (
  id: string,
  fromToken: string,
  toToken: string
): SwapTransactionRecord => ({
  id,
  vaultId: 'vault-1',
  type: 'swap',
  status: 'confirmed',
  chain: 'Ethereum' as Chain,
  timestamp: '2026-03-11T10:00:00Z',
  txHash: `0x${id}`,
  explorerUrl: `https://etherscan.io/tx/0x${id}`,
  fiatValue: '200',
  data: {
    fromToken,
    fromAmount: '1.0',
    fromChain: 'Ethereum' as Chain,
    fromTokenLogo: '',
    fromDecimals: 18,
    toToken,
    toAmount: '2000',
    toChain: 'Ethereum' as Chain,
    toTokenLogo: '',
    toDecimals: 6,
  },
})

const ethSend = makeSendRecord('send-eth', 'ETH')
const btcSend = makeSendRecord('send-btc', 'BTC')
const ethUsdcSwap = makeSwapRecord('swap-1', 'ETH', 'USDC')
const btcRuneSwap = makeSwapRecord('swap-2', 'BTC', 'RUNE')

const allRecords: TransactionRecord[] = [
  ethSend,
  btcSend,
  ethUsdcSwap,
  btcRuneSwap,
]

describe('filterTransactionsBySearch', () => {
  it('returns all records when query is empty', () => {
    const result = filterTransactionsBySearch({
      records: allRecords,
      query: '',
    })
    expect(result).toBe(allRecords)
  })

  it('matches send records by exact token (case-insensitive)', () => {
    const result = filterTransactionsBySearch({
      records: allRecords,
      query: 'eth',
    })
    expect(result).toEqual([ethSend, ethUsdcSwap])
  })

  it('matches with uppercase query', () => {
    const result = filterTransactionsBySearch({
      records: allRecords,
      query: 'BTC',
    })
    expect(result).toEqual([btcSend, btcRuneSwap])
  })

  it('matches partial token names', () => {
    const result = filterTransactionsBySearch({
      records: allRecords,
      query: 'ET',
    })
    expect(result).toEqual([ethSend, ethUsdcSwap])
  })

  it('matches swap records on toToken', () => {
    const result = filterTransactionsBySearch({
      records: allRecords,
      query: 'USDC',
    })
    expect(result).toEqual([ethUsdcSwap])
  })

  it('matches swap records on fromToken', () => {
    const result = filterTransactionsBySearch({
      records: allRecords,
      query: 'RUNE',
    })
    expect(result).toEqual([btcRuneSwap])
  })

  it('returns empty array when no records match', () => {
    const result = filterTransactionsBySearch({
      records: allRecords,
      query: 'DOGE',
    })
    expect(result).toEqual([])
  })

  it('returns empty array for empty records', () => {
    const result = filterTransactionsBySearch({
      records: [],
      query: 'ETH',
    })
    expect(result).toEqual([])
  })

  it('handles mixed-case query', () => {
    const result = filterTransactionsBySearch({
      records: allRecords,
      query: 'Usdc',
    })
    expect(result).toEqual([ethUsdcSwap])
  })
})
