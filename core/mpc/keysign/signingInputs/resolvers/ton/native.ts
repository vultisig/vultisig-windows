import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { numberToEvenHex } from '@lib/utils/hex/numberToHex'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

type BuildNativeTonTransferFromMessageInput = {
  to: string
  amount: string
  payload?: string
  bounceable: boolean
}

type BuildNativeTonTransferInput = {
  keysignPayload: KeysignPayload
  bounceable: boolean
  sendMaxAmount: boolean
}

/** TON cell limit is 1023 bits; comment uses ~32 bits opcode + text. Max ~123 bytes. */
const tonCommentMaxBytes = 123

export const toSafeComment = (payload: string): string => {
  const bytes = new TextEncoder().encode(payload)
  if (bytes.length <= tonCommentMaxBytes) return payload
  return ''
}

/**
 * For TonConnect: payload > 123 bytes is likely base64 BOC (swap, contract call).
 * Use customPayload to pass the full BOC; comment is for simple text only.
 */
const isLargePayload = (payload: string): boolean => {
  const bytes = new TextEncoder().encode(payload)
  return bytes.length > tonCommentMaxBytes
}

export const buildNativeTonTransfer = ({
  keysignPayload,
  bounceable,
  sendMaxAmount,
}: BuildNativeTonTransferInput): TW.TheOpenNetwork.Proto.Transfer => {
  const mode =
    (sendMaxAmount
      ? TW.TheOpenNetwork.Proto.SendMode.ATTACH_ALL_CONTRACT_BALANCE
      : TW.TheOpenNetwork.Proto.SendMode.PAY_FEES_SEPARATELY) |
    TW.TheOpenNetwork.Proto.SendMode.IGNORE_ACTION_PHASE_ERRORS

  const amount = sendMaxAmount
    ? new Long(0)
    : new Long(Number(keysignPayload.toAmount))

  return TW.TheOpenNetwork.Proto.Transfer.create({
    dest: keysignPayload.toAddress,
    amount: Buffer.from(numberToEvenHex(amount), 'hex'),
    bounceable,
    comment: toSafeComment(keysignPayload.memo || ''),
    mode,
  })
}

export const buildNativeTonTransferFromMessage = ({
  to,
  amount,
  payload = '',
  bounceable,
}: BuildNativeTonTransferFromMessageInput): TW.TheOpenNetwork.Proto.Transfer => {
  const mode =
    TW.TheOpenNetwork.Proto.SendMode.PAY_FEES_SEPARATELY |
    TW.TheOpenNetwork.Proto.SendMode.IGNORE_ACTION_PHASE_ERRORS

  const hasLargePayload = payload && isLargePayload(payload)

  return TW.TheOpenNetwork.Proto.Transfer.create({
    dest: to,
    amount: Buffer.from(numberToEvenHex(new Long(Number(amount))), 'hex'),
    bounceable,
    comment: hasLargePayload ? '' : toSafeComment(payload),
    customPayload: hasLargePayload ? payload : undefined,
    mode,
  })
}
