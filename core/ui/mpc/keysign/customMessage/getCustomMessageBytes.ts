import { stripHexPrefix } from '@vultisig/lib-utils/hex/stripHexPrefix'

/**
 * The bytes a custom message stands for: a `0x`-prefixed message is decoded
 * as hex, anything else is UTF-8 encoded. Every check and display of a raw
 * message must go through this, so it sees exactly what the keysign signs.
 */
export const getCustomMessageBytes = (message: string): Uint8Array =>
  message.startsWith('0x')
    ? Buffer.from(stripHexPrefix(message), 'hex')
    : new TextEncoder().encode(message)
