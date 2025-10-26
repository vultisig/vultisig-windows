import { UtxoChain } from '@core/chain/Chain'
import { getUtxoTxSigningInput } from '@core/chain/chains/utxo/tx/signingInput'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { TW } from '@trustwallet/wallet-core'

import { getBlockchainSpecificValue } from '../../chainSpecific/KeysignChainSpecific'
import { getKeysignSwapPayload } from '../../swap/getKeysignSwapPayload'
import { KeysignSwapPayload } from '../../swap/KeysignSwapPayload'
import { getKeysignCoin } from '../../utils/getKeysignCoin'
import { GetTxInputDataInput } from '../resolver'

export const getUtxoTxInputData = ({
  keysignPayload,
  walletCore,
  publicKey,
}: GetTxInputDataInput<'utxo'>) => {
  const { byteFee, sendMaxAmount, psbt } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'utxoSpecific'
  )

  const swapPayload = getKeysignSwapPayload(keysignPayload)
  const amount = swapPayload
    ? getRecordUnionValue(swapPayload).fromAmount
    : keysignPayload.toAmount

  const receiver = swapPayload
    ? matchRecordUnion<KeysignSwapPayload, string>(swapPayload, {
        native: swapPayload => swapPayload.vaultAddress,
        general: () => {
          throw new Error('General swap not supported')
        },
      })
    : keysignPayload.toAddress

  const coin = getKeysignCoin<UtxoChain>(keysignPayload)

  const input = getUtxoTxSigningInput({
    walletCore,
    coin,
    publicKey,
    amount: amount ? BigInt(amount) : undefined,
    sendMaxAmount,
    psbt,
    byteFee: BigInt(byteFee),
    receiver,
    utxoInfo: keysignPayload.utxoInfo,
    memo: keysignPayload.memo,
  })

  return [TW.Bitcoin.Proto.SigningInput.encode(input).finish()]
}
