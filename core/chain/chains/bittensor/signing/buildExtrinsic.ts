/**
 * Bittensor extrinsic construction — bypasses TW Core to include
 * CheckMetadataHash signed extension required by Bittensor runtime.
 *
 * The MPC keysign flow:
 * 1. buildBittensorSigningPayload() → returns the payload bytes to sign
 * 2. MPC signs blake2b-256 hash of the payload
 * 3. assembleBittensorExtrinsic() → wraps call + signature + extensions into final extrinsic
 */

import { decodeAddress } from '@polkadot/util-crypto'

import {
  compactEncode,
  concatBytes,
  encodeMortalEra,
  hexToBytes,
} from './scale'

/** Bittensor Balances.transfer_allow_death call indices (allows full balance send) */
const balancesPallet = 5
const transferAllowDeath = 0

const multiAddressId = 0x00
const multiSignatureEd25519 = 0x00
const metadataHashDisabled = 0x00

export type BittensorSigningParams = {
  toAddress: string
  amount: bigint
  nonce: number
  blockNumber: number
  blockHash: string
  genesisHash: string
  specVersion: number
  transactionVersion: number
  eraPeriod?: number
}

/**
 * Build the call data for balances.transfer_keep_alive(dest, value)
 */
const buildCallData = (toAddress: string, amount: bigint): Uint8Array => {
  const destPubkey = decodeAddress(toAddress)
  return concatBytes(
    new Uint8Array([balancesPallet, transferAllowDeath]),
    new Uint8Array([multiAddressId]),
    destPubkey,
    compactEncode(amount)
  )
}

/**
 * Build the signed extensions (extra) that go into the extrinsic body.
 * Order must match the runtime's SignedExtra tuple:
 *   CheckMortality(Era), CheckNonce(compact), ChargeTransactionPayment(compact), CheckMetadataHash(mode)
 */
const buildSignedExtra = (
  nonce: number,
  blockNumber: number,
  eraPeriod: number
): Uint8Array =>
  concatBytes(
    encodeMortalEra(blockNumber, eraPeriod),
    compactEncode(nonce),
    compactEncode(0), // tip = 0
    new Uint8Array([metadataHashDisabled])
  )

/**
 * Build the additional signed data that extends the signing payload.
 * Order must match the runtime's SignedExtra::AdditionalSigned:
 *   (), specVersion, transactionVersion, genesisHash, blockHash, (), (), (), metadataHash(None)
 *
 * For CheckMetadataHash::Disabled, the additional signed is just 0x00 (None)
 */
const buildAdditionalSigned = (params: BittensorSigningParams): Uint8Array => {
  const specVersionBytes = new Uint8Array(4)
  new DataView(specVersionBytes.buffer).setUint32(0, params.specVersion, true)

  const txVersionBytes = new Uint8Array(4)
  new DataView(txVersionBytes.buffer).setUint32(
    0,
    params.transactionVersion,
    true
  )

  return concatBytes(
    specVersionBytes,
    txVersionBytes,
    hexToBytes(params.genesisHash),
    hexToBytes(params.blockHash),
    new Uint8Array([metadataHashDisabled]) // CheckMetadataHash additional signed
  )
}

/**
 * Build the full signing payload.
 * payload = call ++ signedExtra ++ additionalSigned
 *
 * If payload > 256 bytes, it gets blake2b-256 hashed before signing.
 * Otherwise, it's signed directly.
 */
export const buildBittensorSigningPayload = (
  params: BittensorSigningParams
): { callData: Uint8Array; signedExtra: Uint8Array; payload: Uint8Array } => {
  const callData = buildCallData(params.toAddress, params.amount)
  const signedExtra = buildSignedExtra(
    params.nonce,
    params.blockNumber,
    params.eraPeriod ?? 64
  )
  const additionalSigned = buildAdditionalSigned(params)

  const payload = concatBytes(callData, signedExtra, additionalSigned)

  return { callData, signedExtra, payload }
}

/**
 * Assemble the final signed extrinsic from call data, signature, and signed extensions.
 *
 * Format: compactLength ++ 0x84 (signed v4) ++ MultiAddress::Id(signer) ++ MultiSignature::Ed25519(sig) ++ signedExtra ++ callData
 */
export const assembleBittensorExtrinsic = (
  signerPubkey: Uint8Array,
  signature: Uint8Array,
  callData: Uint8Array,
  signedExtra: Uint8Array
): Uint8Array => {
  const body = concatBytes(
    new Uint8Array([0x84]), // signed extrinsic, version 4
    new Uint8Array([multiAddressId]),
    signerPubkey,
    new Uint8Array([multiSignatureEd25519]),
    signature,
    signedExtra,
    callData
  )

  // Prepend SCALE compact length
  const lengthPrefix = compactEncode(body.length)
  return concatBytes(lengthPrefix, body)
}
