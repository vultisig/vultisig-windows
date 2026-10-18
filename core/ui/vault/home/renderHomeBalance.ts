import { TotalBalanceQuery } from '@core/ui/vault/queries/resolveCoinsTotalBalance'
import { pendingQuery } from '@lib/ui/query/Query'
import { ReactNode } from 'react'

/** Renders a home balance from whichever total the header currently shows. */
export type RenderHomeBalance = (query: TotalBalanceQuery) => ReactNode

/** Shown while the DeFi-aware total's code is still loading. */
export const pendingHomeBalanceQuery: TotalBalanceQuery = {
  ...pendingQuery,
  isUpdating: true,
  isIncomplete: false,
}
