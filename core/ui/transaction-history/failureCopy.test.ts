import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import {
  SendTransactionRecord,
  SwapTransactionRecord,
  TransactionRecord,
} from './core'
import { failureCopy, getRecordFailureReason } from './failureCopy'

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
  data: {
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
    failureReason: 'slippage',
  },
}

const expiredSend: SendTransactionRecord = {
  id: 'record-2',
  vaultId: 'vault-1',
  chain: Chain.Solana,
  txHash: 'signature',
  explorerUrl: '',
  fiatValue: '150',
  timestamp: new Date().toISOString(),
  status: 'failed',
  type: 'send',
  data: {
    fromAddress: '7Zb1h3Z4vYtHk1qSQ9HAtpNQJ4T4r1CqWn2zPnyjF4Lt',
    toAddress: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
    amount: '1000000000',
    token: 'SOL',
    tokenLogo: '',
    decimals: 9,
    lastValidBlockHeight: 312_456_789,
    failureReason: 'expired',
  },
}

/**
 * A record round-tripped through JSON the way storage hands one back, because
 * that is the only way a reason this build's types would not let it write can
 * exist: the build that wrote it had types of its own.
 */
const fromStorage = (record: unknown): TransactionRecord =>
  JSON.parse(JSON.stringify(record))

describe('getRecordFailureReason', () => {
  it('reads the reason a failed swap was given', () => {
    expect(getRecordFailureReason(failedSwap)).toBe('slippage')
  })

  // The chain's own verdict that the transaction never went through, on either
  // record type that can carry it.
  it('reads the expiry a dropped send or swap was failed with', () => {
    expect(getRecordFailureReason(expiredSend)).toBe('expired')
    expect(
      getRecordFailureReason({
        ...failedSwap,
        chain: Chain.Solana,
        data: { ...failedSwap.data, failureReason: 'expired' },
      })
    ).toBe('expired')
    expect(failureCopy.expired.label).toBe('tx_failed_expired')
  })

  // The heal path only rewrites `status`, so a record that turns out to have
  // landed keeps the reason it was failed with. It must stop explaining itself.
  it('stops explaining a record that healed back to confirmed', () => {
    expect(
      getRecordFailureReason({ ...failedSwap, status: 'confirmed' })
    ).toBeUndefined()
    expect(
      getRecordFailureReason({ ...expiredSend, status: 'confirmed' })
    ).toBeUndefined()
  })

  // Records outlive the build that wrote them. Reading an unknown reason
  // straight through would index the copy map with a key it does not hold, and
  // take down every row in the list rather than the one it belongs to.
  it('ignores a reason this build has no wording for', () => {
    const fromNewerBuild = fromStorage({
      ...failedSwap,
      data: { ...failedSwap.data, failureReason: 'insufficientGas' },
    })

    const reason = getRecordFailureReason(fromNewerBuild)

    expect(reason).toBeUndefined()
    expect(reason && failureCopy[reason]).toBeFalsy()
  })

  // Each record type has its own list: slippage has wording, but a send cannot
  // have failed on it, whatever a stored value claims.
  it('ignores a reason the record type cannot have', () => {
    const impossible = fromStorage({
      ...expiredSend,
      data: { ...expiredSend.data, failureReason: 'slippage' },
    })

    expect(getRecordFailureReason(impossible)).toBeUndefined()
  })
})
