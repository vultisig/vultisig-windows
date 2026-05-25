import {
  concatBytes,
  protoBytes,
  protoString,
  protoVarint,
} from '@vultisig/core-chain/chains/cosmos/protoEncoding'

import { encodeAnyMessage, QbtcDappMessage } from './encodeAnyMessage'
import {
  qbtcDefaultFeeAmount,
  qbtcDefaultGasLimit,
  qbtcFeeDenom,
  qbtcMldsaPubKeyTypeUrl,
} from './qbtcDirectConstants'

export type QbtcDappCoin = {
  denom: string
  amount: string
}

export type QbtcDappFee = {
  amount: QbtcDappCoin[]
  gas: string
}

type BuildQBTCDirectPayloadInput = {
  messages: QbtcDappMessage[]
  memo?: string
  fee?: QbtcDappFee
  /** Vault's MLDSA public key, hex-encoded (no `0x` prefix). */
  hexPublicKey: string
  sequence: bigint
}

type QbtcDirectPayloadBytes = {
  /** Base64-encoded TxBody bytes used as `signDirect.bodyBytes`. */
  bodyBytes: string
  /** Base64-encoded AuthInfo bytes used as `signDirect.authInfoBytes`. */
  authInfoBytes: string
}

const buildTxBody = ({
  messages,
  memo,
}: {
  messages: QbtcDappMessage[]
  memo?: string
}): Uint8Array =>
  concatBytes(
    ...messages.map(message => protoBytes(1, encodeAnyMessage(message))),
    memo ? protoString(2, memo) : new Uint8Array(0)
  )

const buildFee = (fee?: QbtcDappFee) => {
  const feeCoins = fee?.amount.length
    ? fee.amount
    : [{ denom: qbtcFeeDenom, amount: qbtcDefaultFeeAmount }]
  const gasLimit = fee?.gas ? BigInt(fee.gas) : qbtcDefaultGasLimit
  return {
    feeCoins,
    gasLimit,
  }
}

const buildAuthInfo = ({
  hexPublicKey,
  sequence,
  fee,
}: {
  hexPublicKey: string
  sequence: bigint
  fee?: QbtcDappFee
}): Uint8Array => {
  const pubKeyData = Buffer.from(hexPublicKey, 'hex')
  const pubKeyMsg = protoBytes(1, pubKeyData)
  const pubKeyAny = concatBytes(
    protoString(1, qbtcMldsaPubKeyTypeUrl),
    protoBytes(2, pubKeyMsg)
  )

  const singleMode = protoVarint(1, 1n)
  const modeInfo = protoBytes(1, singleMode)
  const signerInfo = concatBytes(
    protoBytes(1, pubKeyAny),
    protoBytes(2, modeInfo),
    protoVarint(3, sequence)
  )

  const { feeCoins, gasLimit } = buildFee(fee)
  const feeCoinBytes = feeCoins.map(coin =>
    protoBytes(
      1,
      concatBytes(protoString(1, coin.denom), protoString(2, coin.amount))
    )
  )

  const feeBytes = concatBytes(...feeCoinBytes, protoVarint(2, gasLimit))

  return concatBytes(protoBytes(1, signerInfo), protoBytes(2, feeBytes))
}

/**
 * Builds the `bodyBytes` + `authInfoBytes` used in a Cosmos `SignDoc` for QBTC.
 * Returned as base64 strings because `SignDirect`'s proto schema stores them
 * that way and `applyCosmosFeeFromSignData` re-decodes via `fromBase64`.
 */
export const buildQBTCDirectPayload = ({
  messages,
  memo,
  fee,
  hexPublicKey,
  sequence,
}: BuildQBTCDirectPayloadInput): QbtcDirectPayloadBytes => {
  const bodyBytes = buildTxBody({ messages, memo })
  const authInfoBytes = buildAuthInfo({ hexPublicKey, sequence, fee })
  return {
    bodyBytes: Buffer.from(bodyBytes).toString('base64'),
    authInfoBytes: Buffer.from(authInfoBytes).toString('base64'),
  }
}
