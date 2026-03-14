import { Chain } from '@core/chain/Chain'
import { describe, expect, it, vi } from 'vitest'

import { getPublicKey } from './getPublicKey'

describe('getPublicKey', () => {
  it('decodes Monero chain public keys stored as base64', () => {
    const createWithData = vi.fn((data, type) => ({ data, type }))
    const walletCore = {
      PublicKey: { createWithData },
      PublicKeyType: { ed25519: 'ed25519' },
    } as any
    const keyBytes = Uint8Array.from({ length: 32 }, (_, index) => index + 1)

    const result = getPublicKey({
      chain: Chain.Monero,
      walletCore,
      hexChainCode: '',
      publicKeys: {
        ecdsa: '',
        eddsa: 'ff'.repeat(32),
      },
      chainPublicKeys: {
        [Chain.Monero]: Buffer.from(keyBytes).toString('base64'),
      },
    })

    expect(createWithData).toHaveBeenCalledTimes(1)
    expect(createWithData.mock.calls[0][0]).toEqual(keyBytes)
    expect(createWithData.mock.calls[0][1]).toBe('ed25519')
    expect(result).toEqual({ data: keyBytes, type: 'ed25519' })
  })
})
