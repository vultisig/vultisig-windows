import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { Entry } from '@lib/utils/entities/Entry'

import { decryptedPasscodeEncoding, encryptedPasscodeEncoding } from './config'

export const encryptSample = ({ key, value }: Entry<string, string>) =>
  encryptWithAesGcm({
    key: Buffer.from(key, decryptedPasscodeEncoding),
    value: Buffer.from(value, decryptedPasscodeEncoding),
  }).toString(encryptedPasscodeEncoding)

export const decryptSample = ({ key, value }: Entry<string, string>) =>
  decryptWithAesGcm({
    key: Buffer.from(key, encryptedPasscodeEncoding),
    value: Buffer.from(value, encryptedPasscodeEncoding),
  }).toString(decryptedPasscodeEncoding)
