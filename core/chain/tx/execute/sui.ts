import { getSuiClient } from '@core/chain/chains/sui/client'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW } from '@trustwallet/wallet-core'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeSuiTx: ExecuteTxResolver = async ({ compiledTx }) => {
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
