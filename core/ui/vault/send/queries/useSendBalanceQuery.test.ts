import { Chain } from '@vultisig/core-chain/Chain'
import { accountCoinKeyToString } from '@vultisig/core-chain/coin/AccountCoin'
import { describe, expect, it } from 'vitest'

import {
  getFreshSendBalanceQuery,
  getSendBalanceQueryOptions,
} from './useSendBalanceQuery'

const input = {
  chain: Chain.Bitcoin,
  address: 'bc1qfreshbalance',
} as const
const balanceKey = accountCoinKeyToString(input)
const persistedData = { [balanceKey]: 1_000_000n }

describe('getSendBalanceQueryOptions', () => {
  it('keeps balance persistence while always refreshing on Send mount', () => {
    expect(getSendBalanceQueryOptions(input)).toMatchObject({
      meta: { shouldPersist: true },
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 0,
    })
  })
})

describe('getFreshSendBalanceQuery', () => {
  it('hides a persisted balance until the mounted Send flow refetches it', () => {
    expect(
      getFreshSendBalanceQuery({
        balanceKey,
        data: persistedData,
        dataUpdatedAt: 100,
        error: null,
        freshnessBoundary: 200,
      })
    ).toEqual({ data: undefined, error: null, isPending: true })
  })

  it('exposes the refreshed balance after the mounted fetch completes', () => {
    expect(
      getFreshSendBalanceQuery({
        balanceKey,
        data: { [balanceKey]: 900_000n },
        dataUpdatedAt: 300,
        error: null,
        freshnessBoundary: 200,
      })
    ).toEqual({ data: 900_000n, error: null, isPending: false })
  })

  it('does not fall back to persisted data when the refresh fails', () => {
    const error = new Error('balance refresh failed')

    expect(
      getFreshSendBalanceQuery({
        balanceKey,
        data: persistedData,
        dataUpdatedAt: 100,
        error,
        freshnessBoundary: 200,
      })
    ).toEqual({ data: undefined, error, isPending: false })
  })
})
