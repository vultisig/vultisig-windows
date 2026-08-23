import { queryClientDefaultOptions } from '@lib/ui/query/queryClientDefaultOptions'
import {
  defaultShouldDehydrateQuery,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { accountCoinKeyToString } from '@vultisig/core-chain/coin/AccountCoin'
import { getCoinBalance } from '@vultisig/core-chain/coin/balance'
import { getEvmChainBalances } from '@vultisig/core-chain/coin/balance/getEvmChainBalances'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  balanceQueryKey,
  getBalanceQueryOptions,
  getCoinBalanceQueryAmount,
  getLiveBalanceQueryOptions,
  invalidateBalanceQueries,
} from './useBalancesQuery'

vi.mock('@vultisig/core-chain/coin/balance', () => ({
  getCoinBalance: vi.fn(),
}))

vi.mock('@vultisig/core-chain/coin/balance/getEvmChainBalances', () => ({
  getEvmChainBalances: vi.fn(),
}))

const address = '0x1111111111111111111111111111111111111111'

const ethInput = {
  chain: Chain.Ethereum,
  address,
} as const

const usdcInput = {
  chain: Chain.Ethereum,
  id: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  address,
} as const

const runeInput = {
  chain: Chain.THORChain,
  address: 'thor1wallet',
} as const

describe('getCoinBalanceQueryAmount', () => {
  beforeEach(() => {
    vi.mocked(getCoinBalance).mockReset()
    vi.mocked(getEvmChainBalances).mockReset()
  })

  it('batches EVM balance requests by chain and wallet address', async () => {
    vi.mocked(getEvmChainBalances).mockResolvedValue({
      [accountCoinKeyToString(ethInput)]: 11n,
      [accountCoinKeyToString(usdcInput)]: 22n,
    })

    const [ethBalance, usdcBalance] = await Promise.all([
      getCoinBalanceQueryAmount(ethInput),
      getCoinBalanceQueryAmount(usdcInput),
    ])

    expect(ethBalance).toBe(11n)
    expect(usdcBalance).toBe(22n)
    expect(getEvmChainBalances).toHaveBeenCalledTimes(1)
    expect(getEvmChainBalances).toHaveBeenCalledWith({
      chain: Chain.Ethereum,
      address,
      coins: [ethInput, usdcInput],
    })
    expect(getCoinBalance).not.toHaveBeenCalled()
  })

  it('matches batched EVM balances across wallet address casing differences', async () => {
    const checksumAddress = '0x111111111111111111111111111111111111ABCd'
    const lowercaseInput = {
      chain: Chain.Ethereum,
      address: checksumAddress.toLocaleLowerCase(),
    } as const
    const checksumInput = {
      chain: Chain.Ethereum,
      address: checksumAddress,
    } as const

    vi.mocked(getEvmChainBalances).mockResolvedValue({
      [accountCoinKeyToString(lowercaseInput)]: 55n,
    })

    const [lowercaseBalance, checksumBalance] = await Promise.all([
      getCoinBalanceQueryAmount(lowercaseInput),
      getCoinBalanceQueryAmount(checksumInput),
    ])

    expect(lowercaseBalance).toBe(55n)
    expect(checksumBalance).toBe(55n)
    expect(getEvmChainBalances).toHaveBeenCalledTimes(1)
  })

  it('rejects failed EVM reads instead of reporting them as zero', async () => {
    vi.mocked(getEvmChainBalances).mockResolvedValue({})

    await expect(getCoinBalanceQueryAmount(ethInput)).rejects.toThrow(
      'Failed to resolve Ethereum balance'
    )
  })

  it('preserves genuine zero EVM balances', async () => {
    vi.mocked(getEvmChainBalances).mockResolvedValue({
      [accountCoinKeyToString(ethInput)]: 0n,
    })

    await expect(getCoinBalanceQueryAmount(ethInput)).resolves.toBe(0n)
  })

  it('rejects only failed reads in a partially successful EVM batch', async () => {
    vi.mocked(getEvmChainBalances).mockResolvedValue({
      [accountCoinKeyToString(ethInput)]: 11n,
    })

    const ethBalance = getCoinBalanceQueryAmount(ethInput)
    const usdcBalance = getCoinBalanceQueryAmount(usdcInput)

    await expect(ethBalance).resolves.toBe(11n)
    await expect(usdcBalance).rejects.toThrow(
      'Failed to resolve Ethereum balance'
    )
  })

  it('keeps non-EVM balances on the existing per-coin resolver', async () => {
    vi.mocked(getCoinBalance).mockResolvedValue(33n)

    await expect(getCoinBalanceQueryAmount(runeInput)).resolves.toBe(33n)

    expect(getCoinBalance).toHaveBeenCalledWith(runeInput)
    expect(getEvmChainBalances).not.toHaveBeenCalled()
  })
})

describe('getBalanceQueryOptions', () => {
  beforeEach(() => {
    vi.mocked(getEvmChainBalances).mockReset()
  })

  it('preserves the per-coin query key while using the batched resolver', async () => {
    vi.mocked(getEvmChainBalances).mockResolvedValue({
      [accountCoinKeyToString(ethInput)]: 44n,
    })

    const options = getBalanceQueryOptions(ethInput)

    await expect(options.queryFn()).resolves.toEqual({
      [accountCoinKeyToString(ethInput)]: 44n,
    })
    expect(options.queryKey).toEqual(['coinBalance', ethInput])
    expect(options.queryKey.slice(0, balanceQueryKey.length)).toEqual(
      balanceQueryKey
    )
    expect(options).toMatchObject({
      meta: { shouldPersist: true },
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 30_000,
    })
    expect(options.refetchInterval).toBeUndefined()
    expect(options.refetchIntervalInBackground).toBeUndefined()
  })

  it('adds mount verification and polling only for live wallet observers', () => {
    expect(getLiveBalanceQueryOptions(ethInput)).toMatchObject({
      meta: { shouldPersist: true },
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 30_000,
      refetchInterval: 30_000,
      refetchIntervalInBackground: false,
    })
  })

  it('surfaces a failed EVM batch read as a query error', async () => {
    vi.mocked(getEvmChainBalances).mockResolvedValue({})

    const options = getBalanceQueryOptions(ethInput)

    await expect(options.queryFn()).rejects.toThrow(
      'Failed to resolve Ethereum balance'
    )
  })

  it('does not dehydrate a failed EVM balance read for persistence', async () => {
    vi.mocked(getEvmChainBalances).mockResolvedValue({})
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          ...queryClientDefaultOptions?.queries,
          retry: false,
        },
      },
    })
    const options = getBalanceQueryOptions(ethInput)

    await expect(queryClient.fetchQuery(options)).rejects.toThrow(
      'Failed to resolve Ethereum balance'
    )

    expect(queryClient.getQueryState(options.queryKey)?.status).toBe('error')
    expect(
      dehydrate(queryClient, {
        shouldDehydrateQuery: query =>
          query.meta?.shouldPersist === true &&
          defaultShouldDehydrateQuery(query),
      }).queries
    ).toEqual([])
  })

  it('recovers from a transient EVM read failure through query retries', async () => {
    vi.mocked(getEvmChainBalances)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        [accountCoinKeyToString(ethInput)]: 77n,
      })
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          ...queryClientDefaultOptions?.queries,
          retryDelay: 0,
        },
      },
    })

    await expect(
      queryClient.fetchQuery(getBalanceQueryOptions(ethInput))
    ).resolves.toEqual({
      [accountCoinKeyToString(ethInput)]: 77n,
    })
    expect(getEvmChainBalances).toHaveBeenCalledTimes(2)
  })
})

describe('invalidateBalanceQueries', () => {
  it('invalidates every balance without touching unrelated query families', async () => {
    const queryClient = new QueryClient()
    const ethKey = getBalanceQueryOptions(ethInput).queryKey
    const runeKey = getBalanceQueryOptions(runeInput).queryKey
    const priceKey = ['coinPrices', { coins: ['ETH'] }]

    queryClient.setQueryData(ethKey, { eth: 1n })
    queryClient.setQueryData(runeKey, { rune: 2n })
    queryClient.setQueryData(priceKey, { eth: 3 })

    await invalidateBalanceQueries(queryClient)

    expect(queryClient.getQueryState(ethKey)?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(runeKey)?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(priceKey)?.isInvalidated).toBe(false)

    queryClient.clear()
  })
})
