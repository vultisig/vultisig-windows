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
    ? Long.ZERO
    : Long.fromString(keysignPayload.toAmount)

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

  return TW.TheOpenNetwork.Proto.Transfer.create({
    dest: to,
    amount: Buffer.from(numberToEvenHex(Long.fromString(amount)), 'hex'),
    bounceable,
    comment: '',
    customPayload: payload || undefined,
    mode,
  })
}
