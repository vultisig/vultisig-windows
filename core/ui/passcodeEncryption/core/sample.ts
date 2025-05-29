import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { Entry } from '@lib/utils/entities/Entry'

import { passcodeEncryptionConfig } from './config'

export const encryptSample = ({ key, value }: Entry<string, string>) =>
  encryptWithAesGcm({
    key: Buffer.from(key, passcodeEncryptionConfig.plainTextEncoding),
    value: Buffer.from(value, passcodeEncryptionConfig.plainTextEncoding),
  }).toString(passcodeEncryptionConfig.encryptedEncoding)

export const decryptSample = ({ key, value }: Entry<string, string>) =>
  decryptWithAesGcm({
    key: Buffer.from(key, passcodeEncryptionConfig.plainTextEncoding),
    value: Buffer.from(value, passcodeEncryptionConfig.encryptedEncoding),
  }).toString(passcodeEncryptionConfig.plainTextEncoding)
