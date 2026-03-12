import { TransactionRecord } from '../core'
import { getTransactionTokens } from './getTransactionTokens'

type FilterTransactionsBySearchInput = {
  records: TransactionRecord[]
  query: string
}

/** Filters transaction records by matching token symbols against a search query. */
export const filterTransactionsBySearch = ({
  records,
  query,
}: FilterTransactionsBySearchInput): TransactionRecord[] => {
  if (!query) return records

  const normalizedQuery = query.toLowerCase()

  return records.filter(record =>
    getTransactionTokens(record).some(token => token.includes(normalizedQuery))
  )
}
