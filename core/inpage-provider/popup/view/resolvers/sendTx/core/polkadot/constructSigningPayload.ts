import { compactToU8a, hexToU8a, u8aConcat } from '@polkadot/util'
import { blake2AsU8a } from '@polkadot/util-crypto'

import { PolkadotSignerPayloadJSON } from './PolkadotSignerPayload'

const polkadotSigningPayloadHashThreshold = 256

/**
 * Construct the raw signing payload bytes from a Polkadot SignerPayloadJSON.
 *
 * Follows the Polkadot extrinsic payload v4 encoding:
 * method + era + compact(nonce) + compact(tip) + LE-u32(specVersion) +
 * LE-u32(transactionVersion) + genesisHash + blockHash
 *
 * If the payload exceeds 256 bytes, it is blake2b-256 hashed before signing.
 */
export const constructPolkadotSigningPayload = (
  payload: PolkadotSignerPayloadJSON
): Uint8Array => {
  const method = hexToU8a(payload.method)
  const era = hexToU8a(payload.era)
  const nonce = compactToU8a(parseInt(payload.nonce, 16))
  const tip = compactToU8a(BigInt(payload.tip))

  const specVersion = new Uint8Array(4)
  new DataView(specVersion.buffer).setUint32(
    0,
    parseInt(payload.specVersion, 16),
    true
  )

  const transactionVersion = new Uint8Array(4)
  new DataView(transactionVersion.buffer).setUint32(
    0,
    parseInt(payload.transactionVersion, 16),
    true
  )

  const genesisHash = hexToU8a(payload.genesisHash)
  const blockHash = hexToU8a(payload.blockHash)

  const raw = u8aConcat(
    method,
    era,
    nonce,
    tip,
    specVersion,
    transactionVersion,
    genesisHash,
    blockHash
  )

  if (raw.length > polkadotSigningPayloadHashThreshold) {
    return blake2AsU8a(raw, 256)
  }

  return raw
}
