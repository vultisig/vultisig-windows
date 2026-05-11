import { Query } from '@lib/ui/query/Query'
import { describe, expect, it } from 'vitest'

import {
  getTransactionErrorMessage,
  isSendTxOverviewErrorQuery,
} from './sendTxOverviewError'

describe('SendTxOverview error state', () => {
  it('matches MatchQuery by treating an error as visible only when no data exists', () => {
    const error = new Error('Failed to process transaction')

    expect(
      isSendTxOverviewErrorQuery({
        data: undefined,
        error,
        isPending: false,
      } satisfies Query<unknown>)
    ).toBe(true)

    expect(
      isSendTxOverviewErrorQuery({
        data: { gasEstimation: 21_000n },
        error,
        isPending: false,
      } satisfies Query<unknown>)
    ).toBe(false)

    expect(
      isSendTxOverviewErrorQuery({
        data: undefined,
        error: null,
        isPending: true,
      } satisfies Query<unknown>)
    ).toBe(false)
  })

  it('removes viem version suffixes from displayed transaction errors', () => {
    expect(
      getTransactionErrorMessage(
        'HTTP request failed. Details: Failed to fetch Version: viem@2.47.4'
      )
    ).toBe('HTTP request failed. Details: Failed to fetch')

    expect(
      getTransactionErrorMessage(
        new Error(
          'HTTP request failed. Details: Failed to fetch Version: viem@2.47.4\n'
        )
      )
    ).toBe('HTTP request failed. Details: Failed to fetch')
  })
})
