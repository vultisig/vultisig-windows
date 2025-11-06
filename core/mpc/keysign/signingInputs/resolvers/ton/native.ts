import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { numberToEvenHex } from '@lib/utils/hex/numberToHex'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

type BuildNativeTonTransferInput = {
  keysignPayload: KeysignPayload
  bounceable: boolean
  sendMaxAmount: boolean
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
    comment: keysignPayload.memo || '',
    mode,
  })
}
