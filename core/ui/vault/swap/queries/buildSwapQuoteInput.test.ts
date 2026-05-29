import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { describe, expect, it } from 'vitest'

import {
  stationKyberSwapFallbackSource,
  stationKyberSwapSource,
  stationNativeSwapAffiliateName,
  stationSwapAffiliateConfig,
  stationSwapAffiliateFeeReceiver,
} from '../affiliate/stationSwapAffiliateConfig'
import { buildSwapQuoteInput } from './buildSwapQuoteInput'

const coin: AccountCoin = {
  chain: Chain.Ethereum,
  id: 'ETH',
  address: '0xwallet',
  decimals: 18,
  ticker: 'ETH',
}

describe('buildSwapQuoteInput', () => {
  it('keeps the Station native affiliate name lowercase', () => {
    expect(stationNativeSwapAffiliateName).toBe(
      stationNativeSwapAffiliateName.toLowerCase()
    )
    expect(stationSwapAffiliateConfig.native.affiliateFeeAddress).toBe('stvs')
  })

  it('adds Station affiliate config and removes VULT discount tiers for Station builds', () => {
    const input = buildSwapQuoteInput({
      from: coin,
      to: coin,
      amount: 1n,
      referral: 'friend',
      vultDiscountTier: 'ultimate',
      productBrand: 'station',
    })

    expect(input).toEqual({
      from: coin,
      to: coin,
      amount: 1n,
      referral: 'friend',
      vultDiscountTier: null,
      affiliateConfig: stationSwapAffiliateConfig,
    })
    expect(input.affiliateConfig?.native?.affiliateFeeAddress).toBe('stvs')
    expect(input.affiliateConfig?.oneInch?.referrer).toBe(
      stationSwapAffiliateFeeReceiver
    )
    expect(input.affiliateConfig?.kyber?.referral).toBe(
      stationSwapAffiliateFeeReceiver
    )
    expect(input.affiliateConfig?.kyber?.source).toBe(stationKyberSwapSource)
    expect(stationKyberSwapSource).toBe(stationKyberSwapFallbackSource)
  })

  it('preserves Vultisig quote input behavior', () => {
    const input = buildSwapQuoteInput({
      from: coin,
      to: coin,
      amount: 1n,
      referral: null,
      vultDiscountTier: 'gold',
      productBrand: 'vultisig',
    })

    expect(input).toEqual({
      from: coin,
      to: coin,
      amount: 1n,
      referral: undefined,
      vultDiscountTier: 'gold',
    })
    expect(input).not.toHaveProperty('affiliateConfig')
  })
})
