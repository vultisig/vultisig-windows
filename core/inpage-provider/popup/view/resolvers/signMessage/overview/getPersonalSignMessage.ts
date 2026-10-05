import { getBytes, hexlify } from 'ethers'

const isHexMessage = (message: string) =>
  message.startsWith('0x') || message.startsWith('0X')

/**
 * Bytes of a `personal_sign` message as the popup shows them: hex messages
 * are decoded, anything else is UTF-8 encoded.
 */
export const getPersonalSignMessageBytes = (message: string) =>
  isHexMessage(message) ? getBytes(message) : new TextEncoder().encode(message)

/**
 * Builds the EIP-191 payload that a `personal_sign` request signs: the
 * `\x19Ethereum Signed Message:\n<length>` prefix followed by the message.
 * The length always comes from the message bytes the popup shows, never from
 * the caller, so the signature covers exactly the displayed message.
 * Hex messages come back as hex, plain text as a string.
 */
export const getPersonalSignMessage = (message: string) => {
  const msgBytes = getPersonalSignMessageBytes(message)
  const prefix = `\x19Ethereum Signed Message:\n${msgBytes.length}`

  if (isHexMessage(message)) {
    const prefixBytes = new TextEncoder().encode(prefix)
    const combined = new Uint8Array(prefixBytes.length + msgBytes.length)
    combined.set(prefixBytes)
    combined.set(msgBytes, prefixBytes.length)
    return hexlify(combined)
  }

  return `${prefix}${message}`
}
