import { getSuiClient } from '@core/chain/chains/sui/client'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW } from '@trustwallet/wallet-core'
import { GetSignedTxResolver } from './GetSignedTxResolver'

export const getSignedSuiTx: GetSignedTxResolver = async ({ compiledTx }) => {
  const {
    unsignedTx,
    errorMessage: suiErrorMessage,
    signature: compiledSignature,
  } = TW.Sui.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(suiErrorMessage)

  const rpcClient = getSuiClient()

  const { digest } = await rpcClient.executeTransactionBlock({
    transactionBlock: unsignedTx,
    signature: [compiledSignature],
  })

  return digest
}
