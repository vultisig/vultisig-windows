import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { Entry } from '@lib/utils/entities/Entry'

import { passcodeEncryptionConfig } from './config'

export const encryptSample = async ({
  key,
  value,
}: Entry<string, string>): Promise<string> => {
  const encrypted = await encryptWithAesGcm({
    key: Buffer.from(key, passcodeEncryptionConfig.plainTextEncoding),
    value: Buffer.from(value, passcodeEncryptionConfig.plainTextEncoding),
    useSalt: passcodeEncryptionConfig.useSalt,
  })
  return encrypted.toString(passcodeEncryptionConfig.encryptedEncoding)
}

export const decryptSample = async ({
  key,
  value,
}: Entry<string, string>): Promise<string> => {
  const decrypted = await decryptWithAesGcm({
    key: Buffer.from(key, passcodeEncryptionConfig.plainTextEncoding),
    value: Buffer.from(value, passcodeEncryptionConfig.encryptedEncoding),
    useSalt: passcodeEncryptionConfig.useSalt,
  })
  return decrypted.toString(passcodeEncryptionConfig.plainTextEncoding)
}
