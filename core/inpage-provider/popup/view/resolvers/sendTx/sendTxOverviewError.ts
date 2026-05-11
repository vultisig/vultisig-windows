import { Query } from '@lib/ui/query/Query'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'

/** User-facing message from `error`, with trailing `Version: viem@…` stripped. */
export const getTransactionErrorMessage = (error: unknown) =>
  extractErrorMsg(error).replace(/\sVersion:\s*viem@[^\s]+\s*$/u, '')

/** True when the query has no data yet and is in an error state (visible overview error). */
export const isSendTxOverviewErrorQuery = (query: Query<unknown>) =>
  query.data === undefined && !!query.error
