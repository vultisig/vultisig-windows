import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { TW } from '@trustwallet/wallet-core'
import Long from 'long'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { GetSigningInputInput } from '../resolver'

export const getCardanoSigningInput = ({
  keysignPayload,
  walletCore,
}: GetSigningInputInput<'cardano'>) => {
  const { sendMaxAmount, ttl } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'cardano'
  )

  const coin = shouldBePresent(keysignPayload.coin)

  const input = TW.Cardano.Proto.SigningInput.create({
    transferMessage: TW.Cardano.Proto.Transfer.create({
      toAddress: keysignPayload.toAddress,
      changeAddress: coin.address,
      amount: Long.fromString(keysignPayload.toAmount),
      useMaxAmount: sendMaxAmount,
    }),
    ttl: Long.fromString(ttl.toString()),

    utxos: keysignPayload.utxoInfo.map(({ hash, amount, index }) =>
      TW.Cardano.Proto.TxInput.create({
        outPoint: TW.Cardano.Proto.OutPoint.create({
          txHash: walletCore.HexCoding.decode(stripHexPrefix(hash)),
          outputIndex: Long.fromString(index.toString()),
        }),
        amount: Long.fromString(amount.toString()),
        address: coin.address,
      })
    ),
  })

  return input
}
