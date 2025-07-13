import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { encryptedEncoding } from '@lib/utils/encryption/config'

export type MpcRelayMessage = {
  session_id: string
  from: string
  to: string[]
  body: string
  hash: string
  sequence_no: number
}

type FromRelayMessageBodyInput = {
  body: string
  hexEncryptionKey: string
}

export const fromRelayMessageBody = ({
  body,
  hexEncryptionKey,
}: FromRelayMessageBodyInput) =>
  new Uint8Array(
    decryptWithAesGcm({
      key: Buffer.from(hexEncryptionKey, 'hex'),
      value: Buffer.from(body, encryptedEncoding),
    })
  )

type ToRelayMessageBodyInput = {
  body: Uint8Array
  hexEncryptionKey: string
}

export const toRelayMessageBody = ({
  body,
  hexEncryptionKey,
}: ToRelayMessageBodyInput) =>
  encryptWithAesGcm({
    key: Buffer.from(hexEncryptionKey, 'hex'),
    value: Buffer.from(body),
  }).toString(encryptedEncoding)
