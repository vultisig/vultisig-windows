import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@vultisig/core-mpc/lib/initialize', () => ({
  initializeMpcLib: vi.fn(),
}))

vi.mock('@vultisig/core-mpc/lib/keyshare', () => ({
  toMpcLibKeyshare: ({ keyShare }: { keyShare: string }) => {
    if (!keyShare.endsWith('-share')) {
      throw new Error('Invalid MPC keyshare')
    }

    return {
      publicKey: () => new Uint8Array([1]),
      free: vi.fn(),
    }
  },
}))

vi.mock('@vultisig/core-mpc/mldsa/initializeMldsa', () => ({
  initializeMldsaLib: vi.fn(),
}))

vi.mock('@vultisig/lib-mldsa/vs_wasm', () => ({
  Keyshare: {
    fromBytes: (value: Uint8Array) => {
      if (value.length === 0) {
        throw new Error('Invalid MLDSA keyshare')
      }

      return {
        publicKey: () => new Uint8Array([1]),
        free: vi.fn(),
      }
    },
  },
}))

import {
  encryptVaultAllKeyShares,
  hasPasscodeEncryptedVaultKeyShare,
  readVaultAllKeyShares,
  UnreadableVaultKeySharesError,
} from './vaultKeyShares'

const passcode = '12345'
const plainShares = {
  keyShares: {
    ecdsa: 'ecdsa-share',
    eddsa: 'eddsa-share',
  },
  chainKeyShares: {
    [Chain.Bitcoin]: 'bitcoin-share',
  },
  keyShareMldsa: 'mldsa-share',
}
const vaultMetadata = {
  libType: 'DKLS' as const,
  publicKeys: { ecdsa: '01', eddsa: '01' },
  chainPublicKeys: { [Chain.Bitcoin]: '01' },
  publicKeyMldsa: '01',
}

describe('readVaultAllKeyShares', () => {
  it('returns plaintext shares when passcode encryption is disabled', async () => {
    await expect(
      readVaultAllKeyShares({
        ...plainShares,
        ...vaultMetadata,
        hasPasscodeEncryption: false,
        key: null,
      })
    ).resolves.toEqual(plainShares)
  })

  it('rejects self-identifying ciphertext when the encryption proof is missing', async () => {
    const encrypted = await encryptVaultAllKeyShares({
      ...plainShares,
      key: passcode,
    })

    expect(hasPasscodeEncryptedVaultKeyShare(encrypted)).toBe(true)
    await expect(
      readVaultAllKeyShares({
        ...encrypted,
        ...vaultMetadata,
        hasPasscodeEncryption: false,
        key: null,
      })
    ).rejects.toBeInstanceOf(UnreadableVaultKeySharesError)
  })

  it('returns every decrypted share when the proof and passcode are valid', async () => {
    const encrypted = await encryptVaultAllKeyShares({
      ...plainShares,
      key: passcode,
    })

    await expect(
      readVaultAllKeyShares({
        ...encrypted,
        ...vaultMetadata,
        hasPasscodeEncryption: true,
        key: passcode,
      })
    ).resolves.toEqual(plainShares)
  })

  it('recovers valid plaintext left by an interrupted passcode disable', async () => {
    await expect(
      readVaultAllKeyShares({
        ...plainShares,
        ...vaultMetadata,
        hasPasscodeEncryption: true,
        key: passcode,
      })
    ).resolves.toEqual(plainShares)
  })

  it('rejects the whole vault when any encrypted share cannot be decrypted', async () => {
    const encrypted = await encryptVaultAllKeyShares({
      ...plainShares,
      key: passcode,
    })
    const corruptedEddsa = Buffer.from(encrypted.keyShares.eddsa, 'base64')
    corruptedEddsa[corruptedEddsa.length - 1] ^= 1

    await expect(
      readVaultAllKeyShares({
        ...encrypted,
        ...vaultMetadata,
        keyShares: {
          ...encrypted.keyShares,
          eddsa: corruptedEddsa.toString('base64'),
        },
        hasPasscodeEncryption: true,
        key: passcode,
      })
    ).rejects.toBeInstanceOf(UnreadableVaultKeySharesError)
  })

  it('rejects shares that remain encrypted after one successful decrypt', async () => {
    const encryptedOnce = await encryptVaultAllKeyShares({
      ...plainShares,
      key: passcode,
    })
    const encryptedTwice = await encryptVaultAllKeyShares({
      ...encryptedOnce,
      key: passcode,
    })

    await expect(
      readVaultAllKeyShares({
        ...encryptedTwice,
        ...vaultMetadata,
        hasPasscodeEncryption: true,
        key: passcode,
      })
    ).rejects.toBeInstanceOf(UnreadableVaultKeySharesError)
  })

  it('rejects truncated PBKDF2 ciphertext when the encryption proof is missing', async () => {
    const truncatedCiphertext = Buffer.from([0x56, 0x4c, 0x54, 0x02]).toString(
      'base64'
    )

    await expect(
      readVaultAllKeyShares({
        ...plainShares,
        ...vaultMetadata,
        keyShares: {
          ...plainShares.keyShares,
          ecdsa: truncatedCiphertext,
        },
        hasPasscodeEncryption: false,
        key: null,
      })
    ).rejects.toBeInstanceOf(UnreadableVaultKeySharesError)
  })

  it('rejects arbitrary malformed shares when the encryption proof is missing', async () => {
    await expect(
      readVaultAllKeyShares({
        ...plainShares,
        ...vaultMetadata,
        keyShares: {
          ...plainShares.keyShares,
          ecdsa: 'not-a-keyshare',
        },
        hasPasscodeEncryption: false,
        key: null,
      })
    ).rejects.toBeInstanceOf(UnreadableVaultKeySharesError)
  })

  it('rejects missing required shares', async () => {
    await expect(
      readVaultAllKeyShares({
        ...plainShares,
        ...vaultMetadata,
        keyShares: { ecdsa: '', eddsa: plainShares.keyShares.eddsa },
        hasPasscodeEncryption: false,
        key: null,
      })
    ).rejects.toBeInstanceOf(UnreadableVaultKeySharesError)
  })

  it('rejects a readable share for a different public key', async () => {
    await expect(
      readVaultAllKeyShares({
        ...plainShares,
        ...vaultMetadata,
        publicKeys: { ...vaultMetadata.publicKeys, ecdsa: '02' },
        hasPasscodeEncryption: false,
        key: null,
      })
    ).rejects.toBeInstanceOf(UnreadableVaultKeySharesError)
  })

  it('accepts empty KeyImport master placeholders when real chain shares validate', async () => {
    const keyImportShares = {
      keyShares: { ecdsa: '', eddsa: '' },
      chainKeyShares: { [Chain.Bitcoin]: 'bitcoin-share' },
    }

    await expect(
      readVaultAllKeyShares({
        ...keyImportShares,
        libType: 'KeyImport',
        publicKeys: { ecdsa: 'unused-root', eddsa: 'unused-root' },
        chainPublicKeys: { [Chain.Bitcoin]: '01' },
        hasPasscodeEncryption: false,
        key: null,
      })
    ).resolves.toEqual(keyImportShares)
  })
})
