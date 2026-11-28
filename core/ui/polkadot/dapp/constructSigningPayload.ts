import { compactToU8a, hexToU8a, isHex, u8aConcat, u8aEq } from '@polkadot/util'
import { blake2AsU8a } from '@polkadot/util-crypto'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

import {
  PolkadotSignerPayloadJSON,
  SubstrateChain,
} from './PolkadotSignerPayload'
import { substrateGenesisHash } from './substrateGenesisHash'

const polkadotSigningPayloadHashThreshold = 256

// CheckMetadataHash `mode`: 0 = disabled, 1 = enabled; the runtime decodes
// nothing else, so any other value can only produce an unusable signature.
const checkMetadataHashModes = [0, 1] as const

const substrateHashLength = 32

type DecodeSubstrateHashInput = {
  name: 'blockHash' | 'genesisHash' | 'metadataHash'
  value: string
}

// The payload concatenates these hashes with no length prefix, so a hash of
// any other width shifts every byte after it and the runtime can never
// reconstruct what was signed. `hexToU8a` pads odd-length input and decodes
// non-hex characters without complaint, so the string itself is checked too.
const decodeSubstrateHash = ({ name, value }: DecodeSubstrateHashInput) => {
  if (!isHex(value)) {
    throw new Error(`Invalid ${name}: ${value} is not 0x-prefixed hex`)
  }

  const hash = hexToU8a(value)
  if (hash.length !== substrateHashLength) {
    throw new Error(
      `Invalid ${name} length: expected ${substrateHashLength} bytes, got ${hash.length}`
    )
  }

  return hash
}

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

  const hash = decodeSubstrateHash({
    name: 'metadataHash',
    value: metadataHash,
  })

  return { extra, implicit: u8aConcat(new Uint8Array([1]), hash) }
}

/**
 * The signed extensions' explicit bytes, `era + compact(nonce) + compact(tip)
 * + u8(mode)`: signed after the call, and carried in the extrinsic itself.
 */
export const constructPolkadotExtrinsicExtra = (
  payload: PolkadotSignerPayloadJSON
): Uint8Array =>
  u8aConcat(
    hexToU8a(payload.era),
    compactToU8a(parseInt(payload.nonce, 16)),
    compactToU8a(payload.tip ? BigInt(payload.tip) : 0n),
    encodeCheckMetadataHash(payload).extra
  )

type ConstructPolkadotSigningPayloadInput = {
  payload: PolkadotSignerPayloadJSON
  chain: SubstrateChain
}

// Polkadot and Bittensor sign with the same key, so a payload for the other
// chain would verify there while the user reviewed it as this one.
const decodeGenesisHash = ({
  payload,
  chain,
}: ConstructPolkadotSigningPayloadInput) => {
  const genesisHash = decodeSubstrateHash({
    name: 'genesisHash',
    value: payload.genesisHash,
  })

  if (!u8aEq(genesisHash, hexToU8a(substrateGenesisHash[chain]))) {
    throw new Error(
      `genesisHash ${payload.genesisHash} is not the ${chain} genesis hash`
    )
  }

  return genesisHash
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
 * that disagrees with `mode`, a `blockHash` or `metadataHash` that is not 32
 * bytes, or a `genesisHash` other than `chain`'s own is rejected.
 *
 * If the payload exceeds 256 bytes, it is blake2b-256 hashed before signing.
 */
export const constructPolkadotSigningPayload = ({
  payload,
  chain,
}: ConstructPolkadotSigningPayloadInput): Uint8Array => {
  const method = hexToU8a(payload.method)
  const { implicit: metadataHash } = encodeCheckMetadataHash(payload)

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

  const genesisHash = decodeGenesisHash({ payload, chain })
  const blockHash = decodeSubstrateHash({
    name: 'blockHash',
    value: payload.blockHash,
  })

  const raw = u8aConcat(
    method,
    constructPolkadotExtrinsicExtra(payload),
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
