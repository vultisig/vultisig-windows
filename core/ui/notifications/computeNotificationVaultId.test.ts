import { computeNotificationVaultId as computeWithSdk } from '@vultisig/sdk'
import { describe, expect, it } from 'vitest'

import { computeNotificationVaultId } from './computeNotificationVaultId'

const ecdsaPublicKey =
  '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc'
const hexChainCode =
  'b3a9f2c7d8e1f0a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8'

describe('computeNotificationVaultId', () => {
  it('hashes the ECDSA public key followed by the chain code', () => {
    expect(
      computeNotificationVaultId({
        ecdsaPublicKey: '04testEcdsaPubKeyHex',
        hexChainCode: '00112233445566778899aabbccddeeff',
      })
    ).toBe('456168d997f217cd775b746980ec0b41ae48660bab1e8334c10209a6ea6564cc')
  })

  it('matches the SDK, so the service worker and the popup register the same ID', async () => {
    expect(computeNotificationVaultId({ ecdsaPublicKey, hexChainCode })).toBe(
      await computeWithSdk(ecdsaPublicKey, hexChainCode)
    )
  })
})
