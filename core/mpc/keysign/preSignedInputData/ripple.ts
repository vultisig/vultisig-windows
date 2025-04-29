import { assertField } from '@lib/utils/record/assertField'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { PreSignedInputDataResolver } from './PreSignedInputDataResolver'

export const getRipplePreSignedInputData: PreSignedInputDataResolver<
  'rippleSpecific'
> = ({ keysignPayload, chainSpecific }) => {
  const coin = assertField(keysignPayload, 'coin')
  const pubKeyData = Buffer.from(coin.hexPublicKey, 'hex')

  const { gas, sequence, lastLedgerSequence } = chainSpecific

  const payment = TW.Ripple.Proto.OperationPayment.create({
    destination: keysignPayload.toAddress,
    amount: Long.fromString(keysignPayload.toAmount),
  })
  if (keysignPayload.memo !== undefined) {
    payment.destinationTag = Long.fromString(
      keysignPayload.memo !== '' ? keysignPayload.memo : '0'
    )
  }
  const input = TW.Ripple.Proto.SigningInput.create({
    account: coin.address,
    fee: Long.fromString(gas.toString()),
    sequence: Number(sequence),
    lastLedgerSequence: Number(lastLedgerSequence),
    publicKey: new Uint8Array(pubKeyData),
    opPayment: payment,
  })
  return TW.Ripple.Proto.SigningInput.encode(input).finish()
}
