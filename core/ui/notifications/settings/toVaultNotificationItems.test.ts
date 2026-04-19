import type { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import type { Vault } from '@vultisig/core-mpc/vault/Vault'
import { describe, expect, it } from 'vitest'

import { toVaultNotificationItems } from './toVaultNotificationItems'

type VaultRow = Vault & { coins: AccountCoin[] }

const createVaultRow = (input: {
  name: string
  ecdsaKey: string
  signers: string[]
  localPartyId: string
}): VaultRow => ({
  name: input.name,
  publicKeys: { ecdsa: input.ecdsaKey, eddsa: 'eddsa-placeholder' },
  signers: input.signers,
  localPartyId: input.localPartyId,
  hexChainCode: '0x123',
  keyShares: { ecdsa: 'ks-ecdsa', eddsa: 'ks-eddsa' },
  libType: 'DKLS',
  isBackedUp: true,
  order: 0,
  coins: [],
})

describe('toVaultNotificationItems', () => {
  it('maps vault properties correctly', () => {
    const vault = createVaultRow({
      name: 'My Vault',
      ecdsaKey: 'ecdsa-key-1',
      signers: ['Windows-5001', 'Server-5002'],
      localPartyId: 'Windows-5001',
    })

    expect(toVaultNotificationItems([vault], { 'ecdsa-key-1': true })).toEqual([
      {
        id: 'ecdsa-key-1',
        name: 'My Vault',
        type: 'fast',
        enabled: true,
      },
    ])
  })

  it("detects fast vault when signers include server and local party isn't server", () => {
    const vault = createVaultRow({
      name: 'Fast',
      ecdsaKey: 'k-fast',
      signers: ['Mac-6001', 'Server-6002'],
      localPartyId: 'Mac-6001',
    })

    expect(toVaultNotificationItems([vault], {})).toEqual([
      { id: 'k-fast', name: 'Fast', type: 'fast', enabled: false },
    ])
  })

  it('detects secure vault when no server signer', () => {
    const vault = createVaultRow({
      name: 'Secure',
      ecdsaKey: 'k-secure',
      signers: ['Windows-7001', 'Mac-7002'],
      localPartyId: 'Windows-7001',
    })

    expect(toVaultNotificationItems([vault], {})).toEqual([
      { id: 'k-secure', name: 'Secure', type: 'secure', enabled: false },
    ])
  })

  it('sets enabled from enabledById when ecdsa id is true', () => {
    const vault = createVaultRow({
      name: 'V',
      ecdsaKey: 'id-enabled',
      signers: ['Windows-8001', 'Server-8002'],
      localPartyId: 'Windows-8001',
    })

    expect(
      toVaultNotificationItems([vault], { 'id-enabled': true })
    ).toMatchObject([{ enabled: true }])
  })

  it('defaults enabled to false when id missing from enabledById', () => {
    const vault = createVaultRow({
      name: 'V',
      ecdsaKey: 'id-missing',
      signers: ['Windows-9001', 'Server-9002'],
      localPartyId: 'Windows-9001',
    })

    expect(toVaultNotificationItems([vault], { other: true })).toMatchObject([
      { id: 'id-missing', enabled: false },
    ])
  })

  it('handles multiple vaults with mixed types and enabled flags', () => {
    const fastOn = createVaultRow({
      name: 'Fast On',
      ecdsaKey: 'a',
      signers: ['Linux-1001', 'Server-1002'],
      localPartyId: 'Linux-1001',
    })
    const secureOff = createVaultRow({
      name: 'Secure Off',
      ecdsaKey: 'b',
      signers: ['iPhone-2001', 'iPad-2002'],
      localPartyId: 'iPhone-2001',
    })
    const fastOff = createVaultRow({
      name: 'Fast Off',
      ecdsaKey: 'c',
      signers: ['Extension-3001', 'Server-3002'],
      localPartyId: 'Extension-3001',
    })

    expect(
      toVaultNotificationItems([fastOn, secureOff, fastOff], {
        a: true,
        b: false,
      })
    ).toEqual([
      { id: 'a', name: 'Fast On', type: 'fast', enabled: true },
      { id: 'b', name: 'Secure Off', type: 'secure', enabled: false },
      { id: 'c', name: 'Fast Off', type: 'fast', enabled: false },
    ])
  })

  it('returns empty array for empty vaults', () => {
    expect(toVaultNotificationItems([], { x: true })).toEqual([])
  })

  it('defaults all vaults to disabled when enabledById is empty', () => {
    const v1 = createVaultRow({
      name: 'One',
      ecdsaKey: 'k1',
      signers: ['Windows-4001', 'Server-4002'],
      localPartyId: 'Windows-4001',
    })
    const v2 = createVaultRow({
      name: 'Two',
      ecdsaKey: 'k2',
      signers: ['Android-5001', 'Android-5002'],
      localPartyId: 'Android-5001',
    })

    expect(toVaultNotificationItems([v1, v2], {})).toEqual([
      { id: 'k1', name: 'One', type: 'fast', enabled: false },
      { id: 'k2', name: 'Two', type: 'secure', enabled: false },
    ])
  })
})
