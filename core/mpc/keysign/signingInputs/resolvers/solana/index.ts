import { getCoinType } from '@core/chain/coin/coinType'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { TW } from '@trustwallet/wallet-core'

import { getBlockchainSpecificValue } from '../../../chainSpecific/KeysignChainSpecific'
import { getKeysignSwapPayload } from '../../../swap/getKeysignSwapPayload'
import { getKeysignChain } from '../../../utils/getKeysignChain'
import { SigningInputsResolver } from '../../resolver'
import { getSolanaSendSigningInput } from './send'

export const getSolanaSigningInputs: SigningInputsResolver<'solana'> = ({
  keysignPayload,
  walletCore,
}) => {
  const chain = getKeysignChain(keysignPayload)

  const { recentBlockHash } = getBlockchainSpecificValue(
    keysignPayload.blockchainSpecific,
    'solanaSpecific'
  )

  if (keysignPayload.signData.case === 'signSolana') {
    const coinType = getCoinType({ walletCore, chain })
    const inputs = keysignPayload.signData.value.rawTransactions.map(
      transaction => {
        const decodedData = walletCore.TransactionDecoder.decode(
          coinType,
          Buffer.from(transaction, 'base64')
        )
        const decodedTransaction =
          TW.Solana.Proto.DecodingTransactionOutput.decode(decodedData)
        if (!decodedTransaction.transaction) {
          throw new Error("Can't decode transaction")
        }
        const rawMessage = decodedTransaction.transaction

        return TW.Solana.Proto.SigningInput.create({
          rawMessage,
        })
      }
    )
    return inputs
  }

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
          v0Msg: true,
          recentBlockhash: recentBlockHash,
          rawMessage: transaction,
        })

        return [signingInput]
      },
    })
  }

  return [getSolanaSendSigningInput({ keysignPayload, walletCore })]
}
