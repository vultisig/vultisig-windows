import { assertField } from '@lib/utils/record/assertField'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getBlockchainSpecificValue } from '../chainSpecific/KeysignChainSpecific'
import { TxInputDataResolver } from './TxInputDataResolver'

export const getRippleTxInputData: TxInputDataResolver<'rippleSpecific'> = ({
  keysignPayload,
}) => {
  const { gas, sequence, lastLedgerSequence } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'rippleSpecific'
  )

  const coin = assertField(keysignPayload, 'coin')
  const pubKeyData = Buffer.from(coin.hexPublicKey, 'hex')

  if (keysignPayload.memo) {
    const destinationTag = parseInt(keysignPayload.memo, 10)

    if (
      !isNaN(destinationTag) &&
      destinationTag.toString() === keysignPayload.memo
    ) {
      const payment = TW.Ripple.Proto.OperationPayment.create({
        destination: keysignPayload.toAddress,
        amount: Long.fromString(keysignPayload.toAmount),
        destinationTag: Long.fromNumber(destinationTag),
      })

      const input = TW.Ripple.Proto.SigningInput.create({
        account: coin.address,
        fee: Long.fromString(gas.toString()),
        sequence: Number(sequence),
        lastLedgerSequence: Number(lastLedgerSequence),
        publicKey: new Uint8Array(pubKeyData),
        opPayment: payment,
      })

      return [TW.Ripple.Proto.SigningInput.encode(input).finish()]
    } else {
      const memoDataHex = Buffer.from(keysignPayload.memo, 'utf8')
        .toString('hex')
        .toUpperCase()

      const txJson = {
        TransactionType: 'Payment',
        Account: coin.address,
        Destination: keysignPayload.toAddress,
        Amount: keysignPayload.toAmount,
        Fee: gas.toString(),
        Sequence: Number(sequence),
        LastLedgerSequence: Number(lastLedgerSequence),
        Memos: [
          {
            Memo: {
              MemoData: memoDataHex,
            },
          },
        ],
      }

      const jsonString = JSON.stringify(txJson)

      // Create input with raw_json
      const input = TW.Ripple.Proto.SigningInput.create({
        account: coin.address,
        fee: Long.fromString(gas.toString()),
        sequence: Number(sequence),
        lastLedgerSequence: Number(lastLedgerSequence),
        publicKey: new Uint8Array(pubKeyData),
        rawJson: jsonString,
      })

      return [TW.Ripple.Proto.SigningInput.encode(input).finish()]
    }
  } else {
    // Standard transaction without memo
    const payment = TW.Ripple.Proto.OperationPayment.create({
      destination: keysignPayload.toAddress,
      amount: Long.fromString(keysignPayload.toAmount),
    })

    const input = TW.Ripple.Proto.SigningInput.create({
      account: coin.address,
      fee: Long.fromString(gas.toString()),
      sequence: Number(sequence),
      lastLedgerSequence: Number(lastLedgerSequence),
      publicKey: new Uint8Array(pubKeyData),
      opPayment: payment,
    })

    return [TW.Ripple.Proto.SigningInput.encode(input).finish()]
  }
}
