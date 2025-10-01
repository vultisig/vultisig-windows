import { numberToEvenHex } from '@lib/utils/hex/numberToHex'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { getKeysignTwPublicKey } from '../../tw/getKeysignTwPublicKey'
import { TxInputDataResolver } from '../resolver'

export const getTonTxInputData: TxInputDataResolver<'ton'> = ({
  keysignPayload,
}) => {
  const { expireAt, sequenceNumber, bounceable, sendMaxAmount } =
    getBlockchainSpecificValue(keysignPayload.blockchainSpecific, 'tonSpecific')

  const isStakeOp =
    !!keysignPayload.memo && ['d', 'w'].includes(keysignPayload.memo.trim())
  const shouldBounce = isStakeOp ? true : !!bounceable

  const mode =
    (sendMaxAmount
      ? TW.TheOpenNetwork.Proto.SendMode.ATTACH_ALL_CONTRACT_BALANCE
      : TW.TheOpenNetwork.Proto.SendMode.PAY_FEES_SEPARATELY) |
    TW.TheOpenNetwork.Proto.SendMode.IGNORE_ACTION_PHASE_ERRORS

  // For send-max, amount must be 0 (balance is attached by mode)
  const amount = sendMaxAmount
    ? new Long(0)
    : new Long(Number(keysignPayload.toAmount))

  const tokenTransferMessage = TW.TheOpenNetwork.Proto.Transfer.create({
    dest: keysignPayload.toAddress,
    amount: Buffer.from(numberToEvenHex(amount), 'hex'),
    bounceable: shouldBounce,
    comment: keysignPayload.memo ?? undefined,
    mode,
  })

  const inputObject = {
    walletVersion: TW.TheOpenNetwork.Proto.WalletVersion.WALLET_V4_R2,
    expireAt: Number(expireAt.toString()),
    sequenceNumber: Number(sequenceNumber.toString()),
    messages: [tokenTransferMessage],
    publicKey: getKeysignTwPublicKey(keysignPayload),
  }

  // Native token transfer
  const input = TW.TheOpenNetwork.Proto.SigningInput.create(inputObject)

  // Encode the input
  const encodedInput =
    TW.TheOpenNetwork.Proto.SigningInput.encode(input).finish()

  return [encodedInput]
}
