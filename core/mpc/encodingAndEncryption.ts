import { base64Encode } from '@lib/utils/base64Encode'
import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'

export const decodeDecryptMessage = async (
  message: string,
  hexEncryptionKey: string
): Promise<Uint8Array> => {
  const encryptedMessage = Buffer.from(message, 'base64')
  const decryptedMessage = decryptWithAesGcm({
    key: Buffer.from(hexEncryptionKey, 'hex'),
    value: encryptedMessage,
  })
  return Buffer.from(decryptedMessage.toString(), 'base64')
}

export const encodeEncryptMessage = async (
  message: Uint8Array,
  hexEncryptionKey: string
): Promise<string> => {
  const base64EncodedMessage = base64Encode(message)
  const encryptedMessage = encryptWithAesGcm({
    key: Buffer.from(hexEncryptionKey, 'hex'),
    value: Buffer.from(base64EncodedMessage),
  })
  return base64Encode(encryptedMessage)
}
