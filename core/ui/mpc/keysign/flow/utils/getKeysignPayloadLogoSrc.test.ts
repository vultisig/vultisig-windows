import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCoinLogoSrc } from '../../../../chain/coin/icon/utils/getCoinLogoSrc'
import { getChainLogoSrc } from '../../../../chain/metadata/getChainLogoSrc'
import { customMessageDefaultChain } from '../../customMessage/chains'
import { getKeysignPayloadLogoSrc } from './getKeysignPayloadLogoSrc'

const getKeysignChainMock = vi.hoisted(() => vi.fn())

vi.mock('@vultisig/core-mpc/keysign/utils/getKeysignChain', () => ({
  getKeysignChain: getKeysignChainMock,
}))

vi.mock('../../../../chain/metadata/getChainLogoSrc', () => ({
  getChainLogoSrc: vi.fn((chain: string) => `/core/chains/${chain}.svg`),
}))

vi.mock('../../../../chain/coin/icon/utils/getCoinLogoSrc', () => ({
  getCoinLogoSrc: vi.fn((logo: string) => `/core/coins/${logo}.svg`),
}))

const testChain = 'Ethereum'

type AnyPayload = Parameters<typeof getKeysignPayloadLogoSrc>[0]

const keysignPayload = (logo: string | undefined): AnyPayload =>
  ({
    keysign: {
      coin: logo === undefined ? undefined : { logo, chain: testChain },
    },
  }) as unknown as AnyPayload

const customMessagePayload = (chain?: string): AnyPayload =>
  ({
    custom: { chain },
  }) as unknown as AnyPayload

describe('getKeysignPayloadLogoSrc', () => {
  beforeEach(() => {
    vi.mocked(getCoinLogoSrc).mockClear()
    vi.mocked(getChainLogoSrc).mockClear()
    getKeysignChainMock.mockReset()
    getKeysignChainMock.mockReturnValue(testChain)
  })

  it('uses the coin logo for a standard keysign payload with a logo', () => {
    const result = getKeysignPayloadLogoSrc(keysignPayload('eth'))

    expect(getCoinLogoSrc).toHaveBeenCalledWith('eth')
    expect(getChainLogoSrc).not.toHaveBeenCalled()
    expect(result).toBe('/core/coins/eth.svg')
  })

  it('falls back to the chain logo when the standard keysign coin logo is empty', () => {
    const result = getKeysignPayloadLogoSrc(keysignPayload(''))

    expect(getCoinLogoSrc).not.toHaveBeenCalled()
    expect(getChainLogoSrc).toHaveBeenCalledWith(testChain)
    expect(result).toBe(`/core/chains/${testChain}.svg`)
  })

  it('falls back to the chain logo when the standard keysign coin is missing', () => {
    const result = getKeysignPayloadLogoSrc(keysignPayload(undefined))

    expect(getCoinLogoSrc).not.toHaveBeenCalled()
    expect(getChainLogoSrc).toHaveBeenCalledWith(testChain)
    expect(result).toBe(`/core/chains/${testChain}.svg`)
  })

  it('uses the specified chain logo for a custom message payload', () => {
    const result = getKeysignPayloadLogoSrc(customMessagePayload('Solana'))

    expect(getChainLogoSrc).toHaveBeenCalledWith('Solana')
    expect(getCoinLogoSrc).not.toHaveBeenCalled()
    expect(result).toBe('/core/chains/Solana.svg')
  })

  it('uses the default custom-message chain logo when no chain is specified', () => {
    const result = getKeysignPayloadLogoSrc(customMessagePayload(undefined))

    expect(getChainLogoSrc).toHaveBeenCalledWith(customMessageDefaultChain)
    expect(getCoinLogoSrc).not.toHaveBeenCalled()
    expect(result).toBe(`/core/chains/${customMessageDefaultChain}.svg`)
  })
})
