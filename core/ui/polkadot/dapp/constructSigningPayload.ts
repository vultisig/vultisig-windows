import { compactToU8a, hexToU8a, u8aConcat } from '@polkadot/util'
import { blake2AsU8a } from '@polkadot/util-crypto'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

import { PolkadotSignerPayloadJSON } from './PolkadotSignerPayload'

const polkadotSigningPayloadHashThreshold = 256

// CheckMetadataHash `mode`: 0 = disabled, 1 = enabled; the runtime decodes
// nothing else, so any other value can only produce an unusable signature.
const checkMetadataHashModes = [0, 1] as const

const metadataHashLength = 32

type CheckMetadataHashInput = Pick<
  PolkadotSignerPayloadJSON,
  'mode' | 'metadataHash'
>

// The runtime derives the implicit as `mode == 1 ? Some(hash) : None`, so a
// payload whose two fields disagree can never verify on-chain. Reject it here
// rather than sign bytes the chain will bounce with an opaque "bad signature".
const encodeCheckMetadataHash = ({
  mode = 0,
  metadataHash = null,
}: CheckMetadataHashInput) => {
  if (!isOneOf(mode, checkMetadataHashModes)) {
    throw new Error(`Invalid CheckMetadataHash mode: ${mode}`)
  }

  if ((mode === 1) !== (metadataHash !== null)) {
    throw new Error(
      `CheckMetadataHash mode ${mode} does not match metadataHash ${metadataHash === null ? 'absence' : 'presence'}`
    )
  }

  const extra = new Uint8Array([mode])

  if (metadataHash === null) {
    return { extra, implicit: new Uint8Array([0]) }
  }

  const hash = hexToU8a(metadataHash)
  if (hash.length !== metadataHashLength) {
    throw new Error(
      `Invalid metadataHash length: expected ${metadataHashLength} bytes, got ${hash.length}`
    )
  }

  return { extra, implicit: u8aConcat(new Uint8Array([1]), hash) }
}

/**
 * Construct the raw signing payload bytes from a Polkadot SignerPayloadJSON.
 *
 * Follows the Polkadot extrinsic payload v4 encoding with the
 * `CheckMetadataHash` signed extension in the last position:
 * method + era + compact(nonce) + compact(tip) + u8(mode) +
 * LE-u32(specVersion) + LE-u32(transactionVersion) + genesisHash + blockHash +
 * Option<[u8;32]>(metadataHash)
 *
 * `mode` defaults to 0 and `metadataHash` to `None` when the payload omits
 * them, which is what the runtime reconstructs for a dApp that did not opt
 * into metadata-hash verification. A `mode` outside {0, 1}, a `metadataHash`
 * that disagrees with `mode`, or one that is not 32 bytes is rejected.
 *
 * If the payload exceeds 256 bytes, it is blake2b-256 hashed before signing.
 */
export const constructPolkadotSigningPayload = (
  payload: PolkadotSignerPayloadJSON
): Uint8Array => {
  const method = hexToU8a(payload.method)
  const era = hexToU8a(payload.era)
  const nonce = compactToU8a(parseInt(payload.nonce, 16))
  const tip = compactToU8a(payload.tip ? BigInt(payload.tip) : 0n)
  const { extra: mode, implicit: metadataHash } =
    encodeCheckMetadataHash(payload)

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
    mode,
    specVersion,
    transactionVersion,
    genesisHash,
    blockHash,
    metadataHash
  )

  if (raw.length > polkadotSigningPayloadHashThreshold) {
    return blake2AsU8a(raw, 256)
  }

  return raw
}
