import { Chain, EvmChain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { SwapTransactionRecord, TransactionRecord } from '../core'
import { isUnaskedEvmSwapFailure } from './swapFailureReasonUpdate'

const swapData: SwapTransactionRecord['data'] = {
  fromToken: 'ETH',
  fromAmount: '1',
  fromChain: Chain.Ethereum,
  fromDecimals: 18,
  fromTokenLogo: '',
  toToken: 'USDC',
  toAmount: '3000',
  toDecimals: 6,
  toTokenLogo: '',
  toChain: Chain.Ethereum,
}

const failedSwap: SwapTransactionRecord = {
  id: 'record-1',
  vaultId: 'vault-1',
  chain: Chain.Ethereum,
  txHash: '0xabc',
  explorerUrl: 'https://etherscan.io/tx/0xabc',
  fiatValue: '3000',
  timestamp: new Date().toISOString(),
  status: 'failed',
  type: 'swap',
  data: swapData,
}

const withData = (
  data: Partial<SwapTransactionRecord['data']>
): TransactionRecord => ({
  ...failedSwap,
  data: { ...swapData, ...data },
})

describe('isUnaskedEvmSwapFailure', () => {
  it('asks about a failed EVM swap nothing has asked about yet', () => {
    expect(isUnaskedEvmSwapFailure(failedSwap)).toBe(true)
  })

  it('never asks twice about the same record', () => {
    expect(
      isUnaskedEvmSwapFailure(
        withData({ failureReasonCheckedAt: new Date().toISOString() })
      )
    ).toBe(false)
  })

  // A resting order's hash is its off-chain order UID, which is hex and so
  // passes for a transaction hash while naming no transaction at all.
  it('never asks the chain about a CowSwap order', () => {
    expect(
      isUnaskedEvmSwapFailure(
        withData({ cowSwapOrderApiBase: 'https://api.cow.fi/mainnet' })
      )
    ).toBe(false)
  })

  it('leaves alone what it cannot replay or has no reason to', () => {
    const notCandidates: TransactionRecord[] = [
      { ...failedSwap, status: 'confirmed' },
      { ...failedSwap, chain: Chain.Solana },
    ]

    notCandidates.forEach(record => {
      expect(isUnaskedEvmSwapFailure(record)).toBe(false)
    })
  })

  it('covers every EVM chain', () => {
    Object.values(EvmChain).forEach(chain => {
      expect(isUnaskedEvmSwapFailure({ ...failedSwap, chain })).toBe(true)
    })
  })
})
