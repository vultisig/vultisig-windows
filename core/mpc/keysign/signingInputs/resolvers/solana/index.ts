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
    const rawMessageData = keysignPayload.signData.value.rawMessage
    const coinType = getCoinType({ walletCore, chain })
    const decodedData = walletCore.TransactionDecoder.decode(
      coinType,
      Buffer.from(rawMessageData, 'base64')
    )
    const decodedTransaction =
      TW.Solana.Proto.DecodingTransactionOutput.decode(decodedData)
    if (!decodedTransaction.transaction) {
      throw new Error("Can't decode transaction")
    }
    const rawMessage = decodedTransaction.transaction

    return [
      TW.Solana.Proto.SigningInput.create({
        rawMessage,
      }),
    ]
  }

  const swapPayload = getKeysignSwapPayload(keysignPayload)
  const coinType = getCoinType({
    walletCore,
    chain,
  })

  let transactionData: Uint8Array

  if (swapPayload) {
    const swapTx = matchRecordUnion(swapPayload, {
      native: () => {
        throw new Error('Native swap not supported')
      },
      general: swapPayload => {
        const tx = shouldBePresent(swapPayload.quote?.tx)
        return Buffer.from(tx.data, 'base64')
      },
    }) as Uint8Array

    transactionData = swapTx
  } else {
    const sendSigningInput = getSolanaSendSigningInput({
      keysignPayload,
      walletCore,
    })

    const inputData =
      TW.Solana.Proto.SigningInput.encode(sendSigningInput).finish()

    const encodedTransaction = walletCore.AnySigner.sign(inputData, coinType)

    const signingOutput =
      TW.Solana.Proto.SigningOutput.decode(encodedTransaction)

    if (!signingOutput.encoded) {
      throw new Error("Can't encode send transaction")
    }

    transactionData = Buffer.from(signingOutput.encoded, 'base64')
  }

  const decodedData = walletCore.TransactionDecoder.decode(
    coinType,
    transactionData
  )

  const decodedTransaction =
    TW.Solana.Proto.DecodingTransactionOutput.decode(decodedData)

  if (!decodedTransaction.transaction) {
    throw new Error("Can't decode transaction")
  }

  const transaction = decodedTransaction.transaction

  let rawMessage: TW.Solana.Proto.RawMessage
  let isV0 = false

  if (transaction.legacy) {
    transaction.legacy.recentBlockhash = recentBlockHash
    rawMessage = TW.Solana.Proto.RawMessage.create({
      legacy: transaction.legacy,
      signatures: transaction.signatures,
    })
    isV0 = false
  } else if (transaction.v0) {
    transaction.v0.recentBlockhash = recentBlockHash
    rawMessage = TW.Solana.Proto.RawMessage.create({
      v0: transaction.v0,
      signatures: transaction.signatures,
    })
    isV0 = true
  } else {
    throw new Error('Invalid transaction format')
  }

  const signingInput = TW.Solana.Proto.SigningInput.create({
    v0Msg: isV0,
    recentBlockhash: recentBlockHash,
    rawMessage,
  })

  return [signingInput]
}
