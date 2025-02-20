import { base64Encode } from '@lib/utils/base64Encode'

type EncryptSetupMessageInput = {
  message: Uint8Array<ArrayBufferLike>
  hexEncryptionKey: string
}

export const encryptSetupMessage = ({
  message,
  hexEncryptionKey,
}: EncryptSetupMessageInput) => {
  return base64Encode(message)
}
