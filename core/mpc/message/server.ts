import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { encryptedEncoding } from '@lib/utils/encryption/config'

export const fromMpcServerMessage = (body: string, hexEncryptionKey: string) =>
  new Uint8Array(
    decryptWithAesGcm({
      key: Buffer.from(hexEncryptionKey, 'hex'),
      value: Buffer.from(body, encryptedEncoding),
    })
  )

export const toMpcServerMessage = (
  body: Uint8Array,
  hexEncryptionKey: string
) =>
  encryptWithAesGcm({
    key: Buffer.from(hexEncryptionKey, 'hex'),
    value: Buffer.from(body),
  }).toString(encryptedEncoding)
