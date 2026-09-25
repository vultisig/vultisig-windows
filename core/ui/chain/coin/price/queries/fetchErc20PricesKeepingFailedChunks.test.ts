import { Chain, EvmChain } from '@vultisig/core-chain/Chain'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { describe, expect, it, vi } from 'vitest'

import {
  erc20PriceBatchSize,
  fetchErc20PricesKeepingFailedChunks,
} from './fetchErc20PricesKeepingFailedChunks'

const coin = (id: string) => ({ id, chain: EvmChain.Ethereum })

describe('fetchErc20PricesKeepingFailedChunks', () => {
  it('keeps the previous price only for a batch that failed', async () => {
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

    const prices = await fetchErc20PricesKeepingFailedChunks({
      coins: [failed, ...filler, listed, dropped],
      chain: EvmChain.Ethereum,
      fiatCurrency: 'usd',
      previous: {
        [coinKeyToString({ chain: Chain.Ethereum, id: failed.id })]: 1.96,
        [coinKeyToString({ chain: Chain.Ethereum, id: dropped.id })]: 9,
      },
      getPrices,
    })

    expect(
      prices[coinKeyToString({ chain: Chain.Ethereum, id: failed.id })]
    ).toBe(1.96)
    expect(
      prices[coinKeyToString({ chain: Chain.Ethereum, id: listed.id })]
    ).toBe(2.8)
    expect(
      prices[coinKeyToString({ chain: Chain.Ethereum, id: dropped.id })]
    ).toBeUndefined()
    expect(getPrices).toHaveBeenCalledTimes(3)
  })

  it('throws when every batch fails so the caller keeps the whole previous result', async () => {
    const getPrices = vi.fn().mockRejectedValue(new Error('down'))

    await expect(
      fetchErc20PricesKeepingFailedChunks({
        coins: [coin('0xdead')],
        chain: EvmChain.Ethereum,
        fiatCurrency: 'usd',
        previous: {
          [coinKeyToString({ chain: Chain.Ethereum, id: '0xdead' })]: 4,
        },
        getPrices,
      })
    ).rejects.toThrow('every contract price batch failed')
    expect(getPrices).toHaveBeenCalledTimes(2)
  })
})
