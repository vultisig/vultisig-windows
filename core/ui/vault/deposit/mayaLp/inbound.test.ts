import { ThorchainInboundAddress } from '@vultisig/core-chain/chains/cosmos/thor/getThorchainInboundAddress'
import { describe, expect, it } from 'vitest'

import { assertMayaLpInboundOpen } from './inbound'

const inbound = (
  fields: Partial<ThorchainInboundAddress> = {}
): ThorchainInboundAddress => ({
  address: 'bc1qmayavault',
  chain: 'BTC',
  chain_lp_actions_paused: false,
  chain_trading_paused: false,
  dust_threshold: '10000',
  gas_rate: '10',
  gas_rate_units: 'satsperbyte',
  global_trading_paused: false,
  halted: false,
  observed_fee_rate: '10',
  outbound_fee: '30000',
  outbound_tx_size: '1000',
  pub_key: 'mayapub',
  router: '',
  ...fields,
})

describe('assertMayaLpInboundOpen', () => {
  it('accepts an open chain', () => {
    expect(() => assertMayaLpInboundOpen({ inbound: inbound() })).not.toThrow()
  })

  it('refuses a halted chain', () => {
    expect(() =>
      assertMayaLpInboundOpen({ inbound: inbound({ halted: true }) })
    ).toThrow(/halted/)
  })

  it('refuses paused LP actions or trading', () => {
    for (const paused of [
      { chain_lp_actions_paused: true },
      { chain_trading_paused: true },
      { global_trading_paused: true },
    ]) {
      expect(() =>
        assertMayaLpInboundOpen({ inbound: inbound(paused) })
      ).toThrow(/paused/)
    }
  })

  it('refuses an asset amount under the dust threshold', () => {
    expect(() =>
      assertMayaLpInboundOpen({
        inbound: inbound(),
        amount: { units: 9_999n, decimals: 8 },
      })
    ).toThrow(/minimum/)

    expect(() =>
      assertMayaLpInboundOpen({
        inbound: inbound(),
        amount: { units: 10_000n, decimals: 8 },
      })
    ).not.toThrow()
  })

  it('scales the 8-decimal dust threshold to the coin decimals', () => {
    const eth = inbound({ chain: 'ETH', dust_threshold: '100' })

    expect(() =>
      assertMayaLpInboundOpen({
        inbound: eth,
        amount: { units: 999_999_999_999n, decimals: 18 },
      })
    ).toThrow(/minimum/)

    expect(() =>
      assertMayaLpInboundOpen({
        inbound: eth,
        amount: { units: 1_000_000_000_000n, decimals: 18 },
      })
    ).not.toThrow()
  })
})
