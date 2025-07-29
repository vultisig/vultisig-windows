import { getSuiClient } from '@core/chain/chains/sui/client'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW } from '@trustwallet/wallet-core'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeSuiTx: ExecuteTxResolver = async ({
  compiledTx,
  skipBroadcast,
}) => {
  const {
    unsignedTx,
    errorMessage: suiErrorMessage,
    signature: compiledSignature,
  } = TW.Sui.Proto.SigningOutput.decode(compiledTx)
  if (skipBroadcast) {
    throw 'Sui transactions cannot be executed without broadcasting'
  }
  assertErrorMessage(suiErrorMessage)

  const rpcClient = getSuiClient()

  const { digest } = await rpcClient.executeTransactionBlock({
    transactionBlock: unsignedTx,
    signature: [compiledSignature],
  })

  return { txHash: digest }
}
