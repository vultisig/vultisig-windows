// @vitest-environment happy-dom
import { ExtensionPortfolioRefresh } from '@core/extension/ExtensionPortfolioRefresh'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { pricePersistQueryOptions } from '@lib/ui/query/utils/options'
import { dehydrate, QueryClient, useQuery } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { Chain } from '@vultisig/core-chain/Chain'
import { accountCoinKeyToString } from '@vultisig/core-chain/coin/AccountCoin'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { readBalance, readPrice, portfolio } = vi.hoisted(() => ({
  readBalance: vi.fn(),
  readPrice: vi.fn(),
  portfolio: { coins: [{ chain: 'Bitcoin', address: 'bc1qtest' }] },
}))

vi.mock('@vultisig/core-chain/coin/balance', () => ({
  getCoinBalance: readBalance,
}))
vi.mock('@core/ui/vault/state/currentVault', () => ({
  useCurrentVault: () => ({ publicKeys: { ecdsa: 'test-vault' } }),
}))
vi.mock('@core/ui/vault/state/currentVaultCoins', () => ({
  usePortfolioVaultCoins: () => portfolio.coins,
}))
vi.mock('@core/ui/chain/coin/price/queries/useCoinPricesQuery', () => ({
  useCoinPricesQuery: () =>
    useQuery({
      queryKey: ['testPortfolioPrices'],
      queryFn: readPrice,
      ...pricePersistQueryOptions,
    }),
}))

const balanceKey = getBalanceQueryKey({
  chain: Chain.Bitcoin,
  address: 'bc1qtest',
})
const coinKey = accountCoinKeyToString({
  chain: Chain.Bitcoin,
  address: 'bc1qtest',
})
const priceKey = ['testPortfolioPrices']
const clients: QueryClient[] = []

const createClient = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  clients.push(client)
  return client
}

const deferred = <T,>() => {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

const open = ({
  client = createClient(),
  delayRestore = false,
  activeView = 'settings',
} = {}) => {
  const saved = createClient()
  saved.setQueryData(balanceKey, { [coinKey]: 1n })
  saved.setQueryData(priceKey, { bitcoin: 100 })
  const persisted = {
    timestamp: Date.now(),
    buster: 'test',
    clientState: dehydrate(saved),
  }
  const restoration = deferred<typeof persisted>()
  const persister = {
    persistClient: vi.fn(),
    removeClient: vi.fn(),
    restoreClient: vi.fn(() =>
      delayRestore ? restoration.promise : Promise.resolve(persisted)
    ),
  }
  const view = render(
    <StrictMode>
      <PersistQueryClientProvider
        client={client}
        persistOptions={{ persister, buster: 'test' }}
      >
        <span>{activeView}</span>
        <ExtensionPortfolioRefresh />
      </PersistQueryClientProvider>
    </StrictMode>
  )
  return { client, view, restore: () => restoration.resolve(persisted) }
}

beforeEach(() => {
  vi.clearAllMocks()
  portfolio.coins = [{ chain: Chain.Bitcoin, address: 'bc1qtest' }]
  readBalance.mockResolvedValue(2n)
  readPrice.mockResolvedValue({ bitcoin: 200 })
})
afterEach(() => {
  cleanup()
  clients.splice(0).forEach(client => client.clear())
})

describe('extension portfolio refresh per opening', () => {
  it('waits for restoration, preserves saved data while pending, and updates without a home view', async () => {
    const balance = deferred<bigint>()
    const price = deferred<{ bitcoin: number }>()
    readBalance.mockReturnValue(balance.promise)
    readPrice.mockReturnValue(price.promise)
    const { client, restore } = open({ delayRestore: true })
    expect(readBalance).not.toHaveBeenCalled()
    expect(readPrice).not.toHaveBeenCalled()

    await act(async () => restore())
    await waitFor(() => expect(readBalance).toHaveBeenCalledTimes(1))
    expect(readPrice).toHaveBeenCalledTimes(1)
    expect(client.getQueryData(balanceKey)).toEqual({ [coinKey]: 1n })
    expect(client.getQueryData(priceKey)).toEqual({ bitcoin: 100 })

    await act(async () => {
      balance.resolve(2n)
      price.resolve({ bitcoin: 200 })
    })
    await waitFor(() =>
      expect(client.getQueryData(balanceKey)).toEqual({ [coinKey]: 2n })
    )
    expect(client.getQueryData(priceKey)).toEqual({ bitcoin: 200 })
    expect(readBalance).toHaveBeenCalledTimes(1)
    expect(readPrice).toHaveBeenCalledTimes(1)
  })

  it('retains saved balances and prices when new requests fail', async () => {
    readBalance.mockRejectedValue(new Error('offline'))
    readPrice.mockRejectedValue(new Error('offline'))
    const { client } = open()
    await waitFor(() =>
      expect(client.getQueryState(balanceKey)?.status).toBe('error')
    )
    expect(client.getQueryState(priceKey)?.status).toBe('error')
    expect(client.getQueryData(balanceKey)).toEqual({ [coinKey]: 1n })
    expect(client.getQueryData(priceKey)).toEqual({ bitcoin: 100 })
  })

  it('does not repeat the refresh on a provider remount in the same opening', async () => {
    const { client, view } = open()
    await waitFor(() =>
      expect(client.getQueryData(balanceKey)).toEqual({ [coinKey]: 2n })
    )
    view.unmount()
    open({ client })
    await act(async () => {})
    expect(readBalance).toHaveBeenCalledTimes(1)
    expect(readPrice).toHaveBeenCalledTimes(1)
  })

  it('refreshes again with a new query client less than a minute later', async () => {
    const first = open()
    await waitFor(() => expect(readBalance).toHaveBeenCalledTimes(1))
    first.view.unmount()
    open()
    await waitFor(() => expect(readBalance).toHaveBeenCalledTimes(2))
    expect(readPrice).toHaveBeenCalledTimes(2)
  })
})
