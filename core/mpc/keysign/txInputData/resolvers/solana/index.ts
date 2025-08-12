import { getCoinType } from '@core/chain/coin/coinType'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { TW } from '@trustwallet/wallet-core'

import { getBlockchainSpecificValue } from '../../../chainSpecific/KeysignChainSpecific'
import { getKeysignSwapPayload } from '../../../swap/getKeysignSwapPayload'
import { TxInputDataResolver } from '../../resolver'
import { getSolanaSendTxInputData } from './send'

export const getSolanaTxInputData: TxInputDataResolver<'solana'> = ({
  keysignPayload,
  walletCore,
  chain,
}) => {
  const { recentBlockHash } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'solanaSpecific'
  )

  const swapPayload = getKeysignSwapPayload(keysignPayload)

  if (swapPayload) {
    return matchRecordUnion(swapPayload, {
      native: () => {
        throw new Error('Native swap not supported')
      },
      general: swapPayload => {
        const tx = shouldBePresent(swapPayload.quote?.tx)
        const { data } = tx

        const decodedData = walletCore.TransactionDecoder.decode(
          getCoinType({
            walletCore,
            chain,
          }),
          Buffer.from(data, 'base64')
        )
        const { transaction } =
          TW.Solana.Proto.DecodingTransactionOutput.decode(decodedData)

        if (!transaction) {
          throw new Error("Can't decode swap transaction")
        }

        if (transaction.legacy) {
          transaction.legacy.recentBlockhash = recentBlockHash
        } else if (transaction.v0) {
          transaction.v0.recentBlockhash = recentBlockHash
        }

        const signingInput = TW.Solana.Proto.SigningInput.create({
          recentBlockhash: recentBlockHash,
          rawMessage: transaction,
        })

        return [TW.Solana.Proto.SigningInput.encode(signingInput).finish()]
      },
    })
  }

  return [getSolanaSendTxInputData({ keysignPayload, walletCore })]
}
