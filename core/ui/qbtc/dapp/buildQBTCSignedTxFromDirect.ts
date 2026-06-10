import { sha256 } from '@noble/hashes/sha2.js'
import {
  concatBytes,
  protoBytes,
  protoString,
  protoVarint,
} from '@vultisig/core-chain/chains/cosmos/protoEncoding'

import { qbtcChainId } from './qbtcDirectConstants'

type BuildQBTCSignDocInput = {
  bodyBytes: Uint8Array
  authInfoBytes: Uint8Array
  accountNumber: bigint
}

/**
 * Cosmos `SignDoc` for QBTC. Field layout matches the SDK's QBTCHelper.ts
 * so cross-device cosigning produces identical hashes.
 */
export const buildQBTCSignDoc = ({
  bodyBytes,
  authInfoBytes,
  accountNumber,
}: BuildQBTCSignDocInput): Uint8Array =>
  concatBytes(
    protoBytes(1, bodyBytes),
    protoBytes(2, authInfoBytes),
    protoString(3, qbtcChainId),
    protoVarint(4, accountNumber)
  )

type BuildQBTCSignedTxFromDirectInput = BuildQBTCSignDocInput & {
  /** DER-encoded MLDSA signature returned by the keysign action. */
  derSignature: Uint8Array
}

/**
 * Assembles the broadcast-ready `TxRaw` and its hash for QBTC, given the
 * pre-computed `bodyBytes` + `authInfoBytes` from the dApp's signDirect
 * payload and the MLDSA signature produced by the keysign pipeline.
 */
export const buildQBTCSignedTxFromDirect = ({
  bodyBytes,
  authInfoBytes,
  derSignature,
}: BuildQBTCSignedTxFromDirectInput) => {
  const txRaw = concatBytes(
    protoBytes(1, bodyBytes),
    protoBytes(2, authInfoBytes),
    protoBytes(3, derSignature)
  )
  const txBytesBase64 = Buffer.from(txRaw).toString('base64')
  const serialized = JSON.stringify({
    tx_bytes: txBytesBase64,
    mode: 'BROADCAST_MODE_SYNC',
  })
  const transactionHash = Buffer.from(sha256(txRaw))
    .toString('hex')
    .toUpperCase()
  return { serialized, transactionHash }
}
