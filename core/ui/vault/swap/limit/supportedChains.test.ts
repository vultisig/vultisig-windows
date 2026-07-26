import { Chain } from '@vultisig/core-chain/Chain'
import { ThorchainInboundAddress } from '@vultisig/core-chain/chains/cosmos/thor/getThorchainInboundAddress'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  fetchLimitSwapSupportedChains,
  getLimitSwapSupportedChains,
  staticLimitSwapSupportedChains,
} from './supportedChains'

const inbound = (
  chain: string,
  overrides: Partial<ThorchainInboundAddress> = {}
): ThorchainInboundAddress => ({
  address: 'addr',
  chain,
  chain_lp_actions_paused: false,
  chain_trading_paused: false,
  dust_threshold: '0',
  gas_rate: '0',
  gas_rate_units: 'satsperbyte',
  global_trading_paused: false,
  halted: false,
  observed_fee_rate: '0',
  outbound_fee: '0',
  outbound_tx_size: '0',
  pub_key: 'pub',
  router: '',
  ...overrides,
})

describe('getLimitSwapSupportedChains', () => {
  it('maps live inbounds to chains and always includes THORChain', () => {
    const chains = getLimitSwapSupportedChains([
      inbound('BTC'),
      inbound('ETH'),
      inbound('GAIA'),
    ])

    expect(chains).toContain(Chain.Bitcoin)
    expect(chains).toContain(Chain.Ethereum)
    expect(chains).toContain(Chain.Cosmos)
    // RUNE settles via MsgDeposit, so THORChain never appears in the inbound list.
    expect(chains).toContain(Chain.THORChain)
  })

  it.each([
    ['halted', { halted: true }],
    ['globally paused', { global_trading_paused: true }],
    ['chain paused', { chain_trading_paused: true }],
  ])('excludes a %s chain', (_, overrides) => {
    const chains = getLimitSwapSupportedChains([
      inbound('BTC', overrides),
      inbound('ETH'),
    ])

    expect(chains).not.toContain(Chain.Bitcoin)
    expect(chains).toContain(Chain.Ethereum)
  })

  it('ignores inbound chains with no memo encoding', () => {
    const chains = getLimitSwapSupportedChains([inbound('SOMETHINGNEW')])

    expect(chains).toEqual(staticLimitSwapSupportedChains)
  })

  // An empty picker reads to the user as "this pair is unsupported" when the real
  // problem is a failed fetch, so fall back to the static routable set instead.
  it.each([[[]], [[inbound('BTC', { halted: true })]]])(
    'falls back to the static set when nothing is usable',
    inbounds => {
      expect(getLimitSwapSupportedChains(inbounds)).toEqual(
        staticLimitSwapSupportedChains
      )
    }
  )

  it('treats the inbound chain symbol case-insensitively', () => {
    expect(
      getLimitSwapSupportedChains([inbound(' btc '), inbound('eth')])
    ).toContain(Chain.Bitcoin)
  })
})

describe('fetchLimitSwapSupportedChains', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reduces the live inbound list to routable chains', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify([inbound('BTC')])))
    )

    await expect(fetchLimitSwapSupportedChains()).resolves.toEqual([
      Chain.THORChain,
      Chain.Bitcoin,
    ])
  })

  it('falls back to the static set when the inbound fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down')
      })
    )

    await expect(fetchLimitSwapSupportedChains()).resolves.toEqual(
      staticLimitSwapSupportedChains
    )
  })
})

describe('staticLimitSwapSupportedChains', () => {
  it('covers the chains THORChain routes and excludes the rest', () => {
    expect(staticLimitSwapSupportedChains).toContain(Chain.Bitcoin)
    expect(staticLimitSwapSupportedChains).toContain(Chain.THORChain)
    expect(staticLimitSwapSupportedChains).not.toContain(Chain.Sui)
    expect(staticLimitSwapSupportedChains).not.toContain(Chain.MayaChain)
  })
})
