import { compactToU8a, hexToU8a, u8aConcat } from '@polkadot/util'
import { blake2AsHex } from '@polkadot/util-crypto'

import { constructPolkadotExtrinsicExtra } from './constructSigningPayload'
import { PolkadotSignerPayloadJSON } from './PolkadotSignerPayload'

const signedExtrinsicV4 = 0x84
const multiAddressId = 0x00
const ed25519Signature = 0x00

type GetPolkadotSignedExtrinsicHashInput = {
  payload: PolkadotSignerPayloadJSON
  publicKey: Uint8Array
  signature: Uint8Array
}

/**
 * The hash of the extrinsic a dApp submits around this signature, so the
 * history can link to it and the status poller can find it on chain.
 */
export const getPolkadotSignedExtrinsicHash = ({
  payload,
  publicKey,
  signature,
}: GetPolkadotSignedExtrinsicHashInput): string => {
  const body = u8aConcat(
    new Uint8Array([signedExtrinsicV4, multiAddressId]),
    publicKey,
    new Uint8Array([ed25519Signature]),
    signature,
    constructPolkadotExtrinsicExtra(payload),
    hexToU8a(payload.method)
  )

  return blake2AsHex(u8aConcat(compactToU8a(body.length), body), 256)
}
