import { stripHexPrefix } from '@vultisig/lib-utils/hex/stripHexPrefix'
import { Buffer } from 'buffer'

/**
 * The bytes a custom message stands for: hex behind `0x` is decoded, anything
 * else is UTF-8 encoded. The signers hash these bytes, so anything that
 * inspects what a message authorizes must read the same ones.
 */
export const getCustomMessageBytes = (message: string): Uint8Array =>
  message.startsWith('0x')
    ? Buffer.from(stripHexPrefix(message), 'hex')
    : new TextEncoder().encode(message)
