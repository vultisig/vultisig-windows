import {
  concatBytes,
  protoBytes,
  protoString,
} from '@vultisig/core-chain/chains/cosmos/protoEncoding'

import { getQbtcMessageEncoder } from './messageRegistry'

export type QbtcDappMessage = {
  typeUrl: string
  value: Record<string, unknown>
}

/**
 * Thrown when the dApp supplies a `typeUrl` that the QBTC provider does not
 * know how to proto-encode. Maps to the 4200 EIP-1193 error in `qbtc.ts`.
 */
export class UnsupportedQbtcMessageTypeError extends Error {
  readonly typeUrl: string

  constructor(typeUrl: string) {
    super(`QBTC provider does not support message type: ${typeUrl}`)
    this.typeUrl = typeUrl
    this.name = 'UnsupportedQbtcMessageTypeError'
  }
}

/**
 * Encodes a Cosmos SDK message as a protobuf `Any` (`{ type_url, value }`).
 * The dApp passes camelCase JSON values; `fromPartial` from `cosmjs-types`
 * normalises them to the proto shape before `encode().finish()` serialises
 * to canonical bytes.
 */
export const encodeAnyMessage = ({
  typeUrl,
  value,
}: QbtcDappMessage): Uint8Array => {
  const encoder = getQbtcMessageEncoder(typeUrl)
  if (!encoder) {
    throw new UnsupportedQbtcMessageTypeError(typeUrl)
  }
  const messageBytes = encoder(value)
  return concatBytes(protoString(1, typeUrl), protoBytes(2, messageBytes))
}
