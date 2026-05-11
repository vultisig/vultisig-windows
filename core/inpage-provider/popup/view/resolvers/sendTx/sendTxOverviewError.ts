import { Query } from '@lib/ui/query/Query'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'

export const getTransactionErrorMessage = (error: unknown) =>
  extractErrorMsg(error).replace(/\sVersion:\s*viem@[^\s]+\s*$/u, '')

export const isSendTxOverviewErrorQuery = (query: Query<unknown>) =>
  query.data === undefined && !!query.error
