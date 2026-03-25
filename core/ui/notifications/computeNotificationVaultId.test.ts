import { createHash } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import { computeNotificationVaultId } from './computeNotificationVaultId'

/**
 * Expected digest is from Node's SHA-256 over UTF-8 of the concatenated
 * strings — same encoding as Swift `Data((pubKeyECDSA + hexChainCode).utf8)`.
 */
const iosCompatibleDigest = (ecdsaPubKey: string, hexChainCode: string) =>
  createHash('sha256')
    .update(ecdsaPubKey + hexChainCode, 'utf8')
    .digest('hex')

describe('computeNotificationVaultId', () => {
  it('matches UTF-8 SHA-256 of ecdsa + hexChainCode (iOS-compatible)', async () => {
    const ecdsaPubKey =
      '03d902f23f559dac0c711093adb9e5318a6845d6f95a37d252c0e3fa448497f574'
    const hexChainCode =
      '0000000000000000000000000000000000000000000000000000000000000000'

    const expected = iosCompatibleDigest(ecdsaPubKey, hexChainCode)
    await expect(
      computeNotificationVaultId({ ecdsaPubKey, hexChainCode })
    ).resolves.toBe(expected)
  })

  it('produces a 64-character lowercase hex string', async () => {
    const id = await computeNotificationVaultId({
      ecdsaPubKey: 'abc',
      hexChainCode: '01',
    })
    expect(id).toMatch(/^[0-9a-f]{64}$/)
  })
})
