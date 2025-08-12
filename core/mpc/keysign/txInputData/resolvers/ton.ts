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

  const isMax = Boolean(sendMaxAmount)
  const tokenTransferMessage = TW.TheOpenNetwork.Proto.Transfer.create({
    dest: keysignPayload.toAddress,
    amount: isMax ? Long.UZERO : new Long(Number(keysignPayload.toAmount)),
    bounceable:
      bounceable ??
      ((keysignPayload.memo &&
        ['d', 'w'].includes(keysignPayload.memo.trim())) ||
        false),
    comment: keysignPayload.memo ?? undefined,
    mode:
      (isMax
        ? TW.TheOpenNetwork.Proto.SendMode.ATTACH_ALL_CONTRACT_BALANCE
        : TW.TheOpenNetwork.Proto.SendMode.PAY_FEES_SEPARATELY) |
      TW.TheOpenNetwork.Proto.SendMode.IGNORE_ACTION_PHASE_ERRORS,
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
