import { Chain } from '@vultisig/core-chain/Chain'
import {
  generalSwapProviderName,
  generalSwapProviders,
} from '@vultisig/core-chain/swap/general/GeneralSwapProvider'
import { nativeSwapChains } from '@vultisig/core-chain/swap/native/NativeSwapChain'
import { describe, expect, it } from 'vitest'

import { getChainLogoSrc } from './getChainLogoSrc'
import { getSwapProviderLogoSrc } from './getSwapProviderLogoSrc'

describe('getSwapProviderLogoSrc', () => {
  it('reuses the chain logo for native swap chains', () => {
    nativeSwapChains.forEach(chain => {
      expect(getSwapProviderLogoSrc(chain)).toBe(getChainLogoSrc(chain))
    })
  })

  it('resolves a logo for every general swap provider', () => {
    generalSwapProviders.forEach(provider => {
      expect(getSwapProviderLogoSrc(generalSwapProviderName[provider])).toMatch(
        /^\/core\/swap-providers\/.+\.svg$/
      )
    })
  })

  it('ignores the route hint some providers append to their name', () => {
    expect(getSwapProviderLogoSrc('LI.FI (Stargate)')).toBe(
      getSwapProviderLogoSrc('LI.FI')
    )
  })

  it('returns null for a provider without a logo', () => {
    expect(getSwapProviderLogoSrc('Unknown')).toBeNull()
    expect(getSwapProviderLogoSrc(Chain.Ethereum)).toBeNull()
  })
})
