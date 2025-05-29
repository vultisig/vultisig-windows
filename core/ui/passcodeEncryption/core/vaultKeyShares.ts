import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'

import { VaultKeyShares } from '../../vault/Vault'
import { passcodeEncryptionConfig } from './config'

type Input = {
  keyShares: VaultKeyShares
  key: string
}

export const encryptVaultKeyShares = async ({
  keyShares,
  key,
}: Input): Promise<VaultKeyShares> => {
  const entries = Object.entries(keyShares)

  const encryptedEntries = await Promise.all(
    entries.map(async ([shareKey, value]) => {
      const encrypted = await encryptWithAesGcm({
        key,
        value: Buffer.from(value, passcodeEncryptionConfig.plainTextEncoding),
        useSalt: passcodeEncryptionConfig.useSalt,
      })
      return [
        shareKey,
        encrypted.toString(passcodeEncryptionConfig.encryptedEncoding),
      ]
    })
  )

  return Object.fromEntries(encryptedEntries) as VaultKeyShares
}

export const decryptVaultKeyShares = async ({
  keyShares,
  key,
}: Input): Promise<VaultKeyShares> => {
  const entries = Object.entries(keyShares)

  const decryptedEntries = await Promise.all(
    entries.map(async ([shareKey, value]) => {
      const decrypted = await decryptWithAesGcm({
        key,
        value: Buffer.from(value, passcodeEncryptionConfig.encryptedEncoding),
        useSalt: passcodeEncryptionConfig.useSalt,
      })
      return [
        shareKey,
        decrypted.toString(passcodeEncryptionConfig.plainTextEncoding),
      ]
    })
  )

  return Object.fromEntries(decryptedEntries) as VaultKeyShares
}
