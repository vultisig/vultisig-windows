import { decryptWithAesGcm } from '@vultisig/lib-utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@vultisig/lib-utils/encryption/aesGcm/encryptWithAesGcm'
import {
  encryptedEncoding,
  plainTextEncoding,
} from '@vultisig/lib-utils/encryption/config'
import { Entry } from '@vultisig/lib-utils/entities/Entry'

export const encryptSample = ({ key, value }: Entry<string, string>) =>
  encryptWithAesGcm({
    key: Buffer.from(key, plainTextEncoding),
    value: Buffer.from(value, plainTextEncoding),
  }).toString(encryptedEncoding)

export const decryptSample = ({ key, value }: Entry<string, string>) =>
  decryptWithAesGcm({
    key: Buffer.from(key, plainTextEncoding),
    value: Buffer.from(value, encryptedEncoding),
  }).toString(plainTextEncoding)
