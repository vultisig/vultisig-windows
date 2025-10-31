import { assertField } from '@lib/utils/record/assertField'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { getKeysignTwPublicKey } from '../../tw/getKeysignTwPublicKey'
import { SigningInputsResolver } from '../resolver'

export const getRippleSigningInputs: SigningInputsResolver<'ripple'> = ({
  keysignPayload,
}) => {
  const { gas, sequence, lastLedgerSequence } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'rippleSpecific'
  )

  const coin = assertField(keysignPayload, 'coin')

  const account = coin.address

  const getPayment = (): Pick<
    TW.Ripple.Proto.ISigningInput,
    'opPayment' | 'rawJson'
  > => {
    if (keysignPayload.memo) {
      const destinationTag = parseInt(keysignPayload.memo, 10)

      if (
        !isNaN(destinationTag) &&
        destinationTag.toString() === keysignPayload.memo
      ) {
        const payment = TW.Ripple.Proto.OperationPayment.create({
          destination: keysignPayload.toAddress,
          amount: Long.fromString(keysignPayload.toAmount),
          destinationTag: Long.fromNumber(destinationTag) as any,
        })

        return {
          opPayment: payment,
        }
      } else {
        const memoDataHex = Buffer.from(keysignPayload.memo, 'utf8')
          .toString('hex')
          .toUpperCase()

        const txJson = {
          TransactionType: 'Payment',
          Account: account,
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

        return {
          rawJson: JSON.stringify(txJson),
        }
      }
    }

    return {
      opPayment: TW.Ripple.Proto.OperationPayment.create({
        destination: keysignPayload.toAddress,
        amount: Long.fromString(keysignPayload.toAmount),
      }),
    }
  }

  const input = TW.Ripple.Proto.SigningInput.create({
    account,
    fee: Long.fromString(gas.toString()),
    sequence: Number(sequence),
    lastLedgerSequence: Number(lastLedgerSequence),
    publicKey: getKeysignTwPublicKey(keysignPayload),
    ...getPayment(),
  })

  return [input]
}
