import { getBytes, hexlify } from 'ethers'

type GetPersonalSignMessageInput = {
  message: string
  bytesCount: number
}

/**
 * Builds the EIP-191 payload that a `personal_sign` request signs: the
 * `\x19Ethereum Signed Message:\n<length>` prefix followed by the message.
 * Hex messages come back as hex, plain text as a string.
 */
export const getPersonalSignMessage = ({
  message,
  bytesCount,
}: GetPersonalSignMessageInput) => {
  const isHex = message.startsWith('0x') || message.startsWith('0X')
  const prefix = `\x19Ethereum Signed Message:\n${bytesCount}`

  if (isHex) {
    const prefixBytes = new TextEncoder().encode(prefix)
    const msgBytes = getBytes(message)
    const combined = new Uint8Array(prefixBytes.length + msgBytes.length)
    combined.set(prefixBytes)
    combined.set(msgBytes, prefixBytes.length)
    return hexlify(combined)
  }

  return `${prefix}${message}`
}
