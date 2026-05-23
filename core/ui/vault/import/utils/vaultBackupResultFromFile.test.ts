import { create, toBinary } from '@bufbuild/protobuf'
import { VaultContainerSchema } from '@vultisig/core-mpc/types/vultisig/vault/v1/vault_container_pb'
import { describe, expect, it } from 'vitest'

import { UnsupportedVaultBackupFileError } from './UnsupportedVaultBackupFileError'
import { vaultBackupResultFromFileBytes } from './vaultBackupResultFromFile'

const toArrayBuffer = (value: Uint8Array): ArrayBuffer =>
  new Uint8Array(value).buffer

const textToArrayBuffer = (value: string): ArrayBuffer =>
  toArrayBuffer(new TextEncoder().encode(value))

const createVaultContainerBackup = () => {
  const container = create(VaultContainerSchema, {
    version: 1n,
    vault: 'vault-base64',
    isEncrypted: false,
  })
  const binary = toBinary(VaultContainerSchema, container)

  return textToArrayBuffer(Buffer.from(binary).toString('base64'))
}

describe('vaultBackupResultFromFileBytes', () => {
  it('returns a named vault container result for a valid .vult backup', async () => {
    const buffer = createVaultContainerBackup()

    const [item] = await vaultBackupResultFromFileBytes({
      name: 'share1of2.vult',
      size: buffer.byteLength,
      buffer,
    })

    expect(item.name).toBe('share1of2.vult')
    expect(item.result).toHaveProperty('vaultContainer')
  })

  it('wraps unsupported backup contents in a user-facing error', async () => {
    await expect(
      vaultBackupResultFromFileBytes({
        name: 'not-a-vault.vult',
        size: 12,
        buffer: textToArrayBuffer('not a vault'),
      })
    ).rejects.toBeInstanceOf(UnsupportedVaultBackupFileError)
  })

  it('wraps unsupported backup extensions in a user-facing error', async () => {
    await expect(
      vaultBackupResultFromFileBytes({
        name: 'not-a-vault.txt',
        size: 12,
        buffer: textToArrayBuffer('not a vault'),
      })
    ).rejects.toBeInstanceOf(UnsupportedVaultBackupFileError)
  })
})
