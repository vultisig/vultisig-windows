import { QueryClient } from '@tanstack/react-query'
import { Chain, EvmChain } from '@vultisig/core-chain/Chain'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  erc20PriceBatchSize,
  erc20PriceRetryDelayMs,
  fetchErc20PricesKeepingFailedChunks,
} from './fetchErc20PricesKeepingFailedChunks'
import {
  cachedCoinPricesForFiat,
  keptPriceMaxAge,
} from './previousCoinPricesForFiat'

const coin = (id: string) => ({ id, chain: EvmChain.Ethereum })
const keyFor = (id: string) => coinKeyToString({ chain: Chain.Ethereum, id })
const stamp = (price: number, fetchedAt = 1_000) => ({ price, fetchedAt })

const settle = async <T>(pending: Promise<T>) => {
  await vi.advanceTimersByTimeAsync(erc20PriceRetryDelayMs)
  return pending
}

describe('fetchErc20PricesKeepingFailedChunks', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps the previous price only for a batch that failed', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000)
    const failed = coin('0xdead')
    const listed = coin('0xaaaa')
    const dropped = coin('0xbbbb')
    const filler = Array.from({ length: erc20PriceBatchSize - 1 }, (_, index) =>
      coin(`0x${(index + 1).toString(16).padStart(40, '0')}`)
    )
    const getPrices = vi
      .fn()
      .mockRejectedValueOnce(new Error('batch failed'))
      .mockRejectedValueOnce(new Error('batch failed'))
      .mockResolvedValueOnce({ [listed.id]: 2.8 })

    const prices = await settle(
      fetchErc20PricesKeepingFailedChunks({
        coins: [failed, ...filler, listed, dropped],
        chain: EvmChain.Ethereum,
        fiatCurrency: 'usd',
        previous: {
          [keyFor(failed.id)]: stamp(1.96),
          [keyFor(dropped.id)]: stamp(9),
          ...Object.fromEntries(
            filler.map(coin => [keyFor(coin.id), stamp(1)])
          ),
        },
        getPrices,
      })
    )

    expect(prices[keyFor(failed.id)]).toEqual(stamp(1.96))
    expect(prices[keyFor(listed.id)]?.price).toBe(2.8)
    expect(prices[keyFor(dropped.id)]?.price).toBeNull()
    expect(getPrices).toHaveBeenCalledTimes(3)
  })

  it('returns a price cached under an older coin set when every batch fails', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(5_000)
    const older = coin('0xaaaa')
    const current = coin('0xdead')
    const client = new QueryClient()
    client.setQueryData(
      ['erc20Prices', { coins: [older, current], fiatCurrency: 'usd' }],
      {
        [keyFor(current.id)]: stamp(4, 5_000),
      }
    )
    const getPrices = vi.fn().mockRejectedValue(new Error('down'))

    const prices = await settle(
      fetchErc20PricesKeepingFailedChunks({
        coins: [current],
        chain: EvmChain.Ethereum,
        fiatCurrency: 'usd',
        previous: cachedCoinPricesForFiat(client, 'usd', 5_000),
        getPrices,
      })
    )

    expect(prices[keyFor(current.id)]).toEqual(stamp(4, 5_000))
    expect(getPrices).toHaveBeenCalledTimes(2)
  })

  it('throws when every batch fails and there is no prior price', async () => {
    vi.useFakeTimers()
    const getPrices = vi.fn().mockRejectedValue(new Error('down'))

    const pending = fetchErc20PricesKeepingFailedChunks({
      coins: [coin('0xdead')],
      chain: EvmChain.Ethereum,
      fiatCurrency: 'usd',
      previous: {},
      getPrices,
    })
    const assertion = expect(pending).rejects.toThrow(
      'every contract price batch failed'
    )
    await vi.advanceTimersByTimeAsync(erc20PriceRetryDelayMs)
    await assertion
    expect(getPrices).toHaveBeenCalledTimes(2)
  })

  it('drops a price that expires during the retry', async () => {
    vi.useFakeTimers()
    const start = 10_000_000
    vi.setSystemTime(start)
    const expired = coin('0xdead')
    const getPrices = vi.fn().mockRejectedValue(new Error('down'))

    const pending = fetchErc20PricesKeepingFailedChunks({
      coins: [expired],
      chain: EvmChain.Ethereum,
      fiatCurrency: 'usd',
      previous: {
        [keyFor(expired.id)]: stamp(1.96, start - keptPriceMaxAge + 500),
      },
      getPrices,
    })
    const assertion = expect(pending).rejects.toThrow(
      'every contract price batch failed'
    )
    await vi.advanceTimersByTimeAsync(erc20PriceRetryDelayMs)
    await assertion
  })

  it('throws when every batch fails and only some coins have a usable price', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(5_000)
    const kept = coin('0xaaaa')
    const missing = coin('0xbbbb')
    const getPrices = vi.fn().mockRejectedValue(new Error('down'))

    const pending = fetchErc20PricesKeepingFailedChunks({
      coins: [kept, missing],
      chain: EvmChain.Ethereum,
      fiatCurrency: 'usd',
      previous: { [keyFor(kept.id)]: stamp(1.96, 5_000) },
      getPrices,
    })
    const assertion = expect(pending).rejects.toThrow(
      'every contract price batch failed'
    )
    await vi.advanceTimersByTimeAsync(erc20PriceRetryDelayMs)
    await assertion
  })

  it('throws when another batch succeeded but a failed coin has no usable price', async () => {
    vi.useFakeTimers()
    const failed = coin('0xdead')
    const listed = Array.from({ length: erc20PriceBatchSize }, (_, index) =>
      coin(`0x${(index + 1).toString(16).padStart(40, '0')}`)
    )
    const getPrices = vi
      .fn()
      .mockImplementation(async ({ ids }: { ids: string[] }) => {
        if (ids.includes(failed.id)) throw new Error('batch failed')
        return Object.fromEntries(ids.map(id => [id, 2.8]))
      })

    const pending = fetchErc20PricesKeepingFailedChunks({
      coins: [...listed, failed],
      chain: EvmChain.Ethereum,
      fiatCurrency: 'usd',
      previous: {},
      getPrices,
    })
    const assertion = expect(pending).rejects.toThrow(
      'a failed contract price batch has no usable price'
    )
    await vi.advanceTimersByTimeAsync(erc20PriceRetryDelayMs)
    await assertion
  })

  it('throws when a success returns an id the batch did not ask for', async () => {
    const listed = coin('0xaaaa')
    const getPrices = vi.fn().mockResolvedValue({ '0xnot-requested': 1 })

    await expect(
      fetchErc20PricesKeepingFailedChunks({
        coins: [listed],
        chain: EvmChain.Ethereum,
        fiatCurrency: 'usd',
        previous: { [keyFor(listed.id)]: stamp(1.96) },
        getPrices,
      })
    ).rejects.toThrow()
  })

  it('skips a non-finite price from a successful batch', async () => {
    const listed = coin('0xaaaa')
    const blank = coin('0xbbbb')
    const getPrices = vi.fn().mockResolvedValue({
      [listed.id]: 2.8,
      [blank.id]: Number.NaN,
    })

    const prices = await fetchErc20PricesKeepingFailedChunks({
      coins: [listed, blank],
      chain: EvmChain.Ethereum,
      fiatCurrency: 'usd',
      previous: { [keyFor(blank.id)]: stamp(9) },
      getPrices,
    })

    expect(prices[keyFor(listed.id)]?.price).toBe(2.8)
    expect(prices[keyFor(blank.id)]?.price).toBeNull()
  })

  it('waits before the second try', async () => {
    vi.useFakeTimers()
    const listed = coin('0xaaaa')
    const getPrices = vi
      .fn()
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce({ [listed.id]: 2 })

    const pending = fetchErc20PricesKeepingFailedChunks({
      coins: [listed],
      chain: EvmChain.Ethereum,
      fiatCurrency: 'usd',
      previous: {},
      getPrices,
    })
    await vi.advanceTimersByTimeAsync(erc20PriceRetryDelayMs - 1)
    expect(getPrices).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    const prices = await pending
    expect(prices[keyFor(listed.id)]?.price).toBe(2)
    expect(getPrices).toHaveBeenCalledTimes(2)
  })

  it('does not revive a price that a newer successful lookup omitted', async () => {
    vi.useFakeTimers()
    const cake = coin('0xcake')
    const x = coin('0xaaaa')
    const y = coin('0xbbbb')
    const client = new QueryClient()
    const run = async (
      coins: ReturnType<typeof coin>[],
      getPrices: () => Promise<Record<string, number>>
    ) => {
      const prices = await fetchErc20PricesKeepingFailedChunks({
        coins,
        chain: EvmChain.Ethereum,
        fiatCurrency: 'usd',
        previous: cachedCoinPricesForFiat(client, 'usd'),
        getPrices,
      })
      client.setQueryData(
        ['erc20Prices', { coins, fiatCurrency: 'usd' }],
        prices
      )
    }

    vi.setSystemTime(1_000)
    await run([cake, x, y], async () => ({
      [cake.id]: 1.96,
      [x.id]: 1,
      [y.id]: 3,
    }))
    vi.setSystemTime(2_000)
    await run([cake], async () => ({}))
    vi.setSystemTime(3_000)
    const failed = run([cake, y], async () => {
      throw new Error('down')
    })
    const assertion = expect(failed).rejects.toThrow(
      'every contract price batch failed'
    )
    await vi.advanceTimersByTimeAsync(erc20PriceRetryDelayMs)
    await assertion
  })
})
