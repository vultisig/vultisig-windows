import { sha256 } from '@noble/hashes/sha2.js'
import {
  concatBytes,
  protoBytes,
  protoString,
  protoVarint,
} from '@vultisig/core-chain/chains/cosmos/qbtc/protoEncoding'

/**
 * Builds the AuthInfo / SignDoc / TxRaw bytes for a QBTC `MsgClaimWithProof`
 * transaction. Mirrors the format used by the existing QBTCHelper send path,
 * but is scoped to the claim flow so it can evolve independently.
 *
 * The claim tx is gas-free, so fee coins are omitted. A single MLDSA signer
 * (the claimer) authenticates the Cosmos transaction; BTC ownership is proven
 * separately by the ZK proof inside the message body.
 *
 * TODO: move to @vultisig/core-mpc as QBTCClaimHelper so iOS/Android can
 * reuse it. Tracked in vultisig/vultisig-sdk#282.
 */

const pubKeyTypeURL = '/cosmos.crypto.mldsa.PubKey'
const claimGasLimit = 300_000n

type ClaimTxComponents = {
  bodyBytes: Uint8Array
  authInfoBytes: Uint8Array
}

type BuildClaimAuthInfoInput = {
  mldsaPublicKey: Uint8Array
  sequence: number
}

/** AuthInfo for a gas-free claim tx (no fee coins, MLDSA single signer). */
const buildClaimAuthInfo = ({
  mldsaPublicKey,
  sequence,
}: BuildClaimAuthInfoInput): Uint8Array => {
  const pubKeyMsg = protoBytes(1, mldsaPublicKey)
  const pubKeyAny = concatBytes(
    protoString(1, pubKeyTypeURL),
    protoBytes(2, pubKeyMsg)
  )
  const singleMode = protoVarint(1, 1n)
  const modeInfo = protoBytes(1, singleMode)
  const signerInfo = concatBytes(
    protoBytes(1, pubKeyAny),
    protoBytes(2, modeInfo),
    protoVarint(3, BigInt(sequence))
  )
  const fee = protoBytes(2, protoVarint(2, claimGasLimit))
  return concatBytes(protoBytes(1, signerInfo), fee)
}

type BuildClaimSignDocInput = ClaimTxComponents & {
  chainId: string
  accountNumber: number
}

/** `cosmos.tx.v1beta1.SignDoc` for the claim tx. */
const buildClaimSignDoc = ({
  bodyBytes,
  authInfoBytes,
  chainId,
  accountNumber,
}: BuildClaimSignDocInput): Uint8Array =>
  concatBytes(
    protoBytes(1, bodyBytes),
    protoBytes(2, authInfoBytes),
    protoString(3, chainId),
    protoVarint(4, BigInt(accountNumber))
  )

type BuildClaimPreSignHashInput = Omit<
  BuildClaimSignDocInput,
  'authInfoBytes'
> &
  BuildClaimAuthInfoInput

/** Returns the SHA256 of the SignDoc — the exact bytes the MLDSA key signs. */
export const buildClaimPreSignHash = ({
  bodyBytes,
  chainId,
  accountNumber,
  mldsaPublicKey,
  sequence,
}: BuildClaimPreSignHashInput): {
  hash: Uint8Array
  authInfoBytes: Uint8Array
} => {
  const authInfoBytes = buildClaimAuthInfo({ mldsaPublicKey, sequence })
  const signDoc = buildClaimSignDoc({
    bodyBytes,
    authInfoBytes,
    chainId,
    accountNumber,
  })
  return { hash: sha256(signDoc), authInfoBytes }
}

type AssembleClaimTxRawInput = ClaimTxComponents & {
  signature: Uint8Array
}

/** Wraps the body + auth + signature into a `cosmos.tx.v1beta1.TxRaw`. */
export const assembleClaimTxRaw = ({
  bodyBytes,
  authInfoBytes,
  signature,
}: AssembleClaimTxRawInput): Uint8Array =>
  concatBytes(
    protoBytes(1, bodyBytes),
    protoBytes(2, authInfoBytes),
    protoBytes(3, signature)
  )
