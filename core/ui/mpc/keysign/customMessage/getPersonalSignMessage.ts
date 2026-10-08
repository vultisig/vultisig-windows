import { getBytes, hexlify } from 'ethers'

const eip191Prefix = '\x19Ethereum Signed Message:\n'

// Only well-formed hex behind a lowercase `0x`, the prefix getCustomMessageHex
// and the co-signers decode, is signed as raw bytes. Anything else, such as
// `0xhello` typed into the vault's sign-message form, is signed as UTF-8.
const isHexMessage = (message: string) =>
  /^0x(?:[0-9a-fA-F]{2})*$/.test(message)

const decimalLength = /^(?:0|[1-9][0-9]*)$/

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
 *
 * Co-signers on every platform hash a custom-message payload as-is, so every
 * `personal_sign` initiator must put this payload on the wire, not the bare
 * message.
 */
export const getPersonalSignMessage = (message: string) => {
  const msgBytes = getPersonalSignMessageBytes(message)
  const prefix = `${eip191Prefix}${msgBytes.length}`

  if (isHexMessage(message)) {
    const prefixBytes = new TextEncoder().encode(prefix)
    const combined = new Uint8Array(prefixBytes.length + msgBytes.length)
    combined.set(prefixBytes)
    combined.set(msgBytes, prefixBytes.length)
    return hexlify(combined)
  }

  return `${prefix}${message}`
}

/**
 * Reverses `getPersonalSignMessage`: the message inside an EIP-191 payload,
 * hex if the payload is hex and text otherwise. Returns `undefined` for
 * anything that is not a well-formed envelope, so callers can show the
 * payload as-is.
 */
export const unwrapPersonalSignMessage = (
  payload: string
): string | undefined => {
  const bytes = getPersonalSignMessageBytes(payload)
  const prefixBytes = new TextEncoder().encode(eip191Prefix)

  if (!prefixBytes.every((byte, index) => bytes[index] === byte)) {
    return undefined
  }

  const rest = bytes.subarray(prefixBytes.length)
  const decoder = new TextDecoder()

  // The length runs straight into the message, so a message that starts with
  // digits leaves several candidate splits. At most one matches the byte count.
  for (let digitCount = 1; digitCount <= rest.length; digitCount++) {
    const length = decoder.decode(rest.subarray(0, digitCount))

    if (!decimalLength.test(length)) return undefined

    if (Number(length) === rest.length - digitCount) {
      const msgBytes = rest.subarray(digitCount)
      return isHexMessage(payload)
        ? hexlify(msgBytes)
        : decoder.decode(msgBytes)
    }
  }

  return undefined
}
