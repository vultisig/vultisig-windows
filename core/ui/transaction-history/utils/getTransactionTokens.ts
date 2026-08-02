import { TransactionRecord } from '../core'

/** Extracts lowercased token symbols from a transaction record for search matching. */
export const getTransactionTokens = (record: TransactionRecord): string[] => {
  if (record.type === 'swap') {
    return [
      record.data.fromToken.toLowerCase(),
      record.data.toToken.toLowerCase(),
    ]
  }

  if (record.type === 'limitSwap') {
    return [
      record.data.fromToken.toLowerCase(),
      record.data.buyTicker.toLowerCase(),
    ]
  }

  return [record.data.token.toLowerCase()]
}
