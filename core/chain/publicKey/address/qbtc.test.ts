import { describe, expect, it } from 'vitest'

import { deriveQbtcAddress } from './qbtc'

describe('deriveQbtcAddress', () => {
  it('derives a valid bech32 address with qbtc prefix', () => {
    // Use a known hex public key and verify the address format
    const pubKeyHex = 'aabbccdd'.repeat(8)
    const address = deriveQbtcAddress(pubKeyHex)

    expect(address).toMatch(/^qbtc1[a-z0-9]+$/)
  })

  it('produces deterministic addresses', () => {
    const pubKeyHex = '0123456789abcdef'.repeat(4)
    const address1 = deriveQbtcAddress(pubKeyHex)
    const address2 = deriveQbtcAddress(pubKeyHex)

    expect(address1).toBe(address2)
  })

  it('produces different addresses for different keys', () => {
    const address1 = deriveQbtcAddress('aa'.repeat(32))
    const address2 = deriveQbtcAddress('bb'.repeat(32))

    expect(address1).not.toBe(address2)
  })

  it('produces a 20-byte hash160 address (qbtc1 + 32 chars + 6 checksum)', () => {
    const pubKeyHex = 'ff'.repeat(64)
    const address = deriveQbtcAddress(pubKeyHex)

    // bech32 encoding of 20 bytes = "qbtc1" prefix + 38 chars (32 data + 6 checksum)
    expect(address.startsWith('qbtc1')).toBe(true)
    // Total length: 4 (hrp) + 1 (separator) + 32 (data) + 6 (checksum) = 43
    expect(address.length).toBe(43)
  })
})
