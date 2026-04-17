import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it, vi } from 'vitest'

import { getKeysignPayloadLogoSrc } from './getKeysignPayloadLogoSrc'

vi.mock('../../../../chain/coin/icon/utils/getCoinLogoSrc', () => ({
  getCoinLogoSrc: (logo: string) => `coin:${logo}`,
}))

vi.mock('../../../../chain/metadata/getChainLogoSrc', () => ({
  getChainLogoSrc: (chain: Chain) => `chain:${chain}`,
}))

vi.mock('@vultisig/core-mpc/keysign/utils/getKeysignChain', () => ({
  getKeysignChain: () => Chain.Bitcoin,
}))

describe('getKeysignPayloadLogoSrc', () => {
  it('returns coin logo for keysign payload when coin logo is present', () => {
    const payload = { keysign: { coin: { logo: 'bitcoin.svg' } } } as any
    expect(getKeysignPayloadLogoSrc(payload)).toBe('coin:bitcoin.svg')
  })

  it('falls back to chain logo for keysign payload when coin logo is absent', () => {
    const payload = { keysign: { coin: undefined } } as any
    expect(getKeysignPayloadLogoSrc(payload)).toBe(`chain:${Chain.Bitcoin}`)
  })

  it('returns chain logo for custom message with explicit chain', () => {
    const payload = { custom: { chain: Chain.Ethereum } } as any
    expect(getKeysignPayloadLogoSrc(payload)).toBe(`chain:${Chain.Ethereum}`)
  })

  it('returns default chain logo for custom message without chain', () => {
    const payload = { custom: {} } as any
    expect(getKeysignPayloadLogoSrc(payload)).toBe(`chain:${Chain.Ethereum}`)
  })
})
