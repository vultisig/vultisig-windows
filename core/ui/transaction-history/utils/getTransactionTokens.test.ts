import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { SendTransactionRecord, SwapTransactionRecord } from '../core'
import { getTransactionTokens } from './getTransactionTokens'

const makeSendRecord = (token: string): SendTransactionRecord => ({
  id: 'send-1',
  vaultId: 'vault-1',
  type: 'send',
  status: 'confirmed',
  chain: 'Ethereum' as Chain,
  timestamp: '2026-03-11T10:00:00Z',
  txHash: '0xabc',
  explorerUrl: 'https://etherscan.io/tx/0xabc',
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
  fromToken: string,
  toToken: string
): SwapTransactionRecord => ({
  id: 'swap-1',
  vaultId: 'vault-1',
  type: 'swap',
  status: 'confirmed',
  chain: 'Ethereum' as Chain,
  timestamp: '2026-03-11T10:00:00Z',
  txHash: '0xdef',
  explorerUrl: 'https://etherscan.io/tx/0xdef',
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

describe('getTransactionTokens', () => {
  it('returns single lowercased token for send records', () => {
    const record = makeSendRecord('ETH')
    expect(getTransactionTokens(record)).toEqual(['eth'])
  })

  it('returns both lowercased tokens for swap records', () => {
    const record = makeSwapRecord('ETH', 'USDC')
    expect(getTransactionTokens(record)).toEqual(['eth', 'usdc'])
  })

  it('preserves already-lowercase tokens', () => {
    const record = makeSendRecord('sol')
    expect(getTransactionTokens(record)).toEqual(['sol'])
  })

  it('normalizes mixed-case tokens', () => {
    const record = makeSwapRecord('Btc', 'Rune')
    expect(getTransactionTokens(record)).toEqual(['btc', 'rune'])
  })
})
