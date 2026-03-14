import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { describe, expect, it, vi } from 'vitest'

import { LibType } from '../vultisig/keygen/v1/lib_type_message_pb'
import {
  Vault_KeyShareSchema,
  VaultSchema,
} from '../vultisig/vault/v1/vault_pb'

const froztBundle = Buffer.from('frozt-bundle').toString('base64')
const fromtBundle = Buffer.from('fromt-bundle').toString('base64')
const froztPackage = Buffer.from('frozt-package').toString('base64')
const saplingExtras = Buffer.from('sapling-extras').toString('base64')
const fromtPublicKey = Buffer.from([0x12, 0x34]).toString('base64')

vi.mock('../../../../lib/frozt/frozt_wasm', () => ({
  frozt_keyshare_bundle_pub_key_package: vi.fn((bundle: Uint8Array) => {
    expect(Buffer.from(bundle).toString()).toBe('frozt-bundle')
    return new Uint8Array(Buffer.from('frozt-package'))
  }),
  frozt_keyshare_bundle_sapling_extras: vi.fn((bundle: Uint8Array) => {
    expect(Buffer.from(bundle).toString()).toBe('frozt-bundle')
    return new Uint8Array(Buffer.from('sapling-extras'))
  }),
  frozt_pubkeypackage_verifying_key: vi.fn((pubKeyPackage: Uint8Array) => {
    expect(Buffer.from(pubKeyPackage).toString()).toBe('frozt-package')
    return new Uint8Array([0xab, 0xcd])
  }),
}))

vi.mock('../../../../lib/fromt/fromt_wasm', () => ({
  fromt_derive_spend_pub_key: vi.fn((bundle: Uint8Array) => {
    expect(Buffer.from(bundle).toString()).toBe('fromt-bundle')
    return new Uint8Array([0x12, 0x34])
  }),
}))

import { fromCommVault, toCommVault } from './commVault'

describe('commVault', () => {
  it('stores key-import vault metadata for grouped chains and frost protocols', () => {
    const commVault = toCommVault({
      name: 'Imported Vault',
      publicKeys: {
        ecdsa: 'ecdsa-pub',
        eddsa: 'eddsa-pub',
      },
      signers: ['server', 'device'],
      createdAt: Date.now(),
      hexChainCode: 'chain-code',
      keyShares: {
        ecdsa: 'ecdsa-share',
        eddsa: 'eddsa-share',
      },
      localPartyId: 'server',
      libType: 'KeyImport',
      isBackedUp: false,
      order: 0,
      chainPublicKeys: {
        [Chain.Cosmos]: 'group-pub',
        [Chain.Osmosis]: 'group-pub',
        [Chain.ZcashSapling]: froztPackage,
        [Chain.Monero]: fromtPublicKey,
      },
      chainKeyShares: {
        [Chain.Cosmos]: 'group-share',
        [Chain.Osmosis]: 'group-share',
        [Chain.ZcashSapling]: froztBundle,
        [Chain.Monero]: fromtBundle,
      },
      publicKeyMldsa: 'mldsa-pub',
      keyShareMldsa: 'mldsa-share',
      saplingExtras,
      lastPasswordVerificationTime: Date.now(),
    })

    expect(commVault.libType).toBe(LibType.KEYIMPORT)
    expect(commVault.publicKeyMldsa44).toBe('mldsa-pub')
    expect(commVault.publicKeyFrozt).toBe('abcd')
    expect(commVault.publicKeyFromt).toBe('1234')
    expect(
      commVault.keyShares.filter(keyShare => keyShare.publicKey === 'group-pub')
    ).toHaveLength(1)
    expect(
      commVault.chainPublicKeys.find(
        entry => entry.chain === Chain.ZcashSapling
      )?.publicKey
    ).toBe('abcd')
    expect(
      commVault.chainPublicKeys.find(entry => entry.chain === 'SaplingExtras')
    ).toBeUndefined()
  })

  it('restores grouped key-import shares and frost bundle metadata from comm vaults', () => {
    const vault = fromCommVault(
      create(VaultSchema, {
        name: 'Imported Vault',
        publicKeyEcdsa: 'ecdsa-pub',
        publicKeyEddsa: 'eddsa-pub',
        signers: ['server', 'device'],
        hexChainCode: 'chain-code',
        localPartyId: 'server',
        libType: LibType.KEYIMPORT,
        publicKeyMldsa44: 'mldsa-pub',
        publicKeyFrozt: 'abcd',
        publicKeyFromt: '1234',
        keyShares: [
          create(Vault_KeyShareSchema, {
            publicKey: 'ecdsa-pub',
            keyshare: 'ecdsa-share',
          }),
          create(Vault_KeyShareSchema, {
            publicKey: 'eddsa-pub',
            keyshare: 'eddsa-share',
          }),
          create(Vault_KeyShareSchema, {
            publicKey: 'mldsa-pub',
            keyshare: 'mldsa-share',
          }),
          create(Vault_KeyShareSchema, {
            publicKey: 'group-pub',
            keyshare: 'group-share',
          }),
          create(Vault_KeyShareSchema, {
            publicKey: 'abcd',
            keyshare: froztBundle,
          }),
          create(Vault_KeyShareSchema, {
            publicKey: '1234',
            keyshare: fromtBundle,
          }),
        ],
        chainPublicKeys: [
          {
            chain: Chain.Cosmos,
            publicKey: 'group-pub',
            isEddsa: false,
          },
          {
            chain: Chain.Osmosis,
            publicKey: 'group-pub',
            isEddsa: false,
          },
        ],
      })
    )

    expect(vault.libType).toBe('KeyImport')
    expect(vault.publicKeyMldsa).toBe('mldsa-pub')
    expect(vault.keyShareMldsa).toBe('mldsa-share')
    expect(vault.chainKeyShares?.[Chain.Cosmos]).toBe('group-share')
    expect(vault.chainKeyShares?.[Chain.Osmosis]).toBe('group-share')
    expect(vault.chainPublicKeys?.[Chain.ZcashSapling]).toBe(froztPackage)
    expect(vault.chainKeyShares?.[Chain.ZcashSapling]).toBe(froztBundle)
    expect(vault.saplingExtras).toBe(saplingExtras)
    expect(vault.chainPublicKeys?.[Chain.Monero]).toBe(fromtPublicKey)
    expect(vault.chainKeyShares?.[Chain.Monero]).toBe(fromtBundle)
  })
})
