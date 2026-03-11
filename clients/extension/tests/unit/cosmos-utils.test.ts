import { describe, expect, it } from 'vitest'

import { getCosmosChainFromAddress } from '@clients/extension/src/utils/cosmos/getCosmosChainFromAddress'

describe('getCosmosChainFromAddress', () => {
  describe('valid Cosmos chain prefixes', () => {
    it('returns Cosmos for cosmos1... addresses', () => {
      expect(getCosmosChainFromAddress('cosmos1abc123xyz')).toBe('Cosmos')
    })

    it('returns Osmosis for osmo1... addresses', () => {
      expect(getCosmosChainFromAddress('osmo1abc123xyz')).toBe('Osmosis')
    })

    it('returns Terra for terra1... addresses', () => {
      expect(getCosmosChainFromAddress('terra1abc123xyz')).toBe('Terra')
    })

    it('returns Akash for akash1... addresses', () => {
      expect(getCosmosChainFromAddress('akash1abc123xyz')).toBe('Akash')
    })

    it('returns Kujira for kujira1... addresses', () => {
      expect(getCosmosChainFromAddress('kujira1abc123xyz')).toBe('Kujira')
    })

    it('returns Noble for noble1... addresses', () => {
      expect(getCosmosChainFromAddress('noble1abc123xyz')).toBe('Noble')
    })
  })

  describe('invalid inputs', () => {
    it('returns null for unknown prefix', () => {
      expect(getCosmosChainFromAddress('unknown1abc')).toBeNull()
    })

    it('returns null when no "1" separator is present', () => {
      expect(getCosmosChainFromAddress('cosmosabc')).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(getCosmosChainFromAddress('')).toBeNull()
    })

    it('returns null for uppercase prefix (regex is lowercase only)', () => {
      expect(getCosmosChainFromAddress('COSMOS1abc')).toBeNull()
    })

    it('returns null for mixed case prefix', () => {
      expect(getCosmosChainFromAddress('Cosmos1abc')).toBeNull()
    })
  })

  describe('edge cases', () => {
    it('handles address with only prefix and 1', () => {
      expect(getCosmosChainFromAddress('cosmos1')).toBe('Cosmos')
    })

    it('handles realistic bech32 address', () => {
      expect(
        getCosmosChainFromAddress(
          'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02'
        )
      ).toBe('Cosmos')
    })

    it('handles address with numbers in prefix', () => {
      // The regex allows alphanumeric prefixes
      expect(getCosmosChainFromAddress('abc123prefix1xyz')).toBeNull()
    })
  })
})
