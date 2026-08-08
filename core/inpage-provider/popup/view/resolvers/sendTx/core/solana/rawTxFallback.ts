import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'

import type { SolanaTxData } from './types/types'

export const getSerializedSolanaTxBuffer = (data: string[]): Buffer => {
  if (!data[0]) {
    throw new Error(
      'Invalid Solana transaction: missing serialized transaction data'
    )
  }

  return Buffer.from(data[0], 'base64')
}

/**
 * Falls back to raw Solana review when no parser can prove destination or amount.
 */
export const getSolanaRawTxFallback = (
  transactions: string[]
): SolanaTxData => ({
  raw: {
    inputCoin: chainFeeCoin.Solana,
    inAmount: '0',
    transactions,
  },
})

export const getSolanaMultiTxRawFallback = (
  transactions: string[]
): SolanaTxData | undefined => {
  if (transactions.length <= 1) {
    return undefined
  }

  getSerializedSolanaTxBuffer(transactions)

  return getSolanaRawTxFallback(transactions)
}
