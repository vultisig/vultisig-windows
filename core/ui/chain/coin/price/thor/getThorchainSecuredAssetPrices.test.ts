import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockQueryUrl, mockGetCoinPrices } = vi.hoisted(() => ({
  mockQueryUrl: vi.fn(),
  mockGetCoinPrices: vi.fn(),
}))

vi.mock('@vultisig/lib-utils/query/queryUrl', () => ({
  queryUrl: mockQueryUrl,
}))

vi.mock('@vultisig/core-chain/coin/price/getCoinPrices', () => ({
  getCoinPrices: mockGetCoinPrices,
}))

import {
  getThorchainSecuredAssetFiatPrices,
  getThorchainSecuredAssetPrices,
  isThorchainSecuredAssetDenom,
  securedAssetDenomToPoolAsset,
} from './getThorchainSecuredAssetPrices'

describe('isThorchainSecuredAssetDenom', () => {
  it('accepts hyphenated secured-asset denoms', () => {
    expect(isThorchainSecuredAssetDenom('btc-btc')).toBe(true)
    expect(isThorchainSecuredAssetDenom('gaia-atom')).toBe(true)
    expect(
      isThorchainSecuredAssetDenom(
        'eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
      )
    ).toBe(true)
  })

  it('rejects native, factory, LP and dotted denoms', () => {
    expect(isThorchainSecuredAssetDenom('rune')).toBe(false)
    expect(isThorchainSecuredAssetDenom('x/ruji')).toBe(false)
    expect(isThorchainSecuredAssetDenom('x/brune')).toBe(false)
    expect(isThorchainSecuredAssetDenom('thor.lqdy')).toBe(false)
    expect(
      isThorchainSecuredAssetDenom(
        'x/bow-xyk-gaia-atom-eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
      )
    ).toBe(false)
  })
})

describe('securedAssetDenomToPoolAsset', () => {
  it('uppercases and turns only the leading chain hyphen into a dot', () => {
    expect(securedAssetDenomToPoolAsset('btc-btc')).toBe('BTC.BTC')
    expect(securedAssetDenomToPoolAsset('gaia-atom')).toBe('GAIA.ATOM')
    expect(
      securedAssetDenomToPoolAsset(
        'eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
      )
    ).toBe('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')
  })
})

describe('getThorchainSecuredAssetPrices', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps denoms to pool asset_tor_price scaled down by 10^8', async () => {
    mockQueryUrl.mockResolvedValue([
      { asset: 'BTC.BTC', asset_tor_price: '6417195738200' },
      { asset: 'GAIA.ATOM', asset_tor_price: '153753700' },
      {
        asset: 'ETH.XRUNE-0X69FA0FEE221AD11012BAB0FDB45D444D3D2CE71C',
        asset_tor_price: '69927',
      },
    ])

    const prices = await getThorchainSecuredAssetPrices([
      'btc-btc',
      'gaia-atom',
      'eth-xrune-0x69fa0fee221ad11012bab0fdb45d444d3d2ce71c',
    ])

    expect(prices['btc-btc']).toBeCloseTo(64171.957382, 4)
    expect(prices['gaia-atom']).toBeCloseTo(1.537537, 4)
    expect(
      prices['eth-xrune-0x69fa0fee221ad11012bab0fdb45d444d3d2ce71c']
    ).toBeCloseTo(0.00069927, 8)
  })

  it('omits denoms without an available pool and zero-priced pools', async () => {
    mockQueryUrl.mockResolvedValue([
      { asset: 'BTC.BTC', asset_tor_price: '6417195738200' },
      { asset: 'ETH.ETH', asset_tor_price: '0' },
    ])

    const prices = await getThorchainSecuredAssetPrices([
      'btc-btc',
      'eth-eth',
      'ltc-ltc',
    ])

    expect(prices['btc-btc']).toBeGreaterThan(0)
    expect('eth-eth' in prices).toBe(false)
    expect('ltc-ltc' in prices).toBe(false)
  })

  it('returns an empty map when the pools request fails', async () => {
    mockQueryUrl.mockRejectedValue(new Error('network'))

    const prices = await getThorchainSecuredAssetPrices(['btc-btc'])

    expect(prices).toEqual({})
  })
})

describe('getThorchainSecuredAssetFiatPrices', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns USD pool prices unchanged for USD without fetching an anchor', async () => {
    mockQueryUrl.mockResolvedValue([
      { asset: 'BTC.BTC', asset_tor_price: '6417195738200' },
    ])

    const prices = await getThorchainSecuredAssetFiatPrices({
      denoms: ['btc-btc'],
      fiatCurrency: 'usd',
    })

    expect(prices['btc-btc']).toBeCloseTo(64171.957382, 4)
    expect(mockGetCoinPrices).not.toHaveBeenCalled()
  })

  it('converts USD pool prices to the selected fiat via the usd-coin anchor', async () => {
    mockQueryUrl.mockResolvedValue([
      { asset: 'BTC.BTC', asset_tor_price: '6417195738200' },
    ])
    mockGetCoinPrices.mockResolvedValue({ 'usd-coin': 0.9 })

    const prices = await getThorchainSecuredAssetFiatPrices({
      denoms: ['btc-btc'],
      fiatCurrency: 'eur',
    })

    expect(prices['btc-btc']).toBeCloseTo(64171.957382 * 0.9, 2)
  })

  it('returns no prices when the usd anchor is missing for a non-USD currency', async () => {
    mockQueryUrl.mockResolvedValue([
      { asset: 'BTC.BTC', asset_tor_price: '6417195738200' },
    ])
    // Successful response that does not include the usd-coin anchor.
    mockGetCoinPrices.mockResolvedValue({})

    const prices = await getThorchainSecuredAssetFiatPrices({
      denoms: ['btc-btc'],
      fiatCurrency: 'eur',
    })

    expect(prices).toEqual({})
  })
})
