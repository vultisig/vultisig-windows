import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { getMayaLpAssetChain, getMayaLpPool, mayaLpChains } from './config'

describe('MayaChain LP config', () => {
  it('names each chain’s native pool', () => {
    expect(mayaLpChains.map(getMayaLpPool)).toEqual([
      'BTC.BTC',
      'ETH.ETH',
      'ARB.ETH',
      'DASH.DASH',
      'ZEC.ZEC',
    ])
  })

  it('maps a native pool back to its chain', () => {
    expect(getMayaLpAssetChain('ARB.ETH')).toBe(Chain.Arbitrum)
    expect(getMayaLpAssetChain('btc.btc')).toBe(Chain.Bitcoin)
  })

  it('has no asset chain for pools the vault cannot fund', () => {
    expect(
      getMayaLpAssetChain('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')
    ).toBeUndefined()
    expect(getMayaLpAssetChain('THOR.RUNE')).toBeUndefined()
  })
})
