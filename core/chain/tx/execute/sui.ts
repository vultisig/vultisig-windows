import { OtherChain } from '@core/chain/Chain'
import { getSuiClient } from '@core/chain/chains/sui/client'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeSuiTx: ExecuteTxResolver<OtherChain.Sui> = async ({
  tx,
  skipBroadcast,
}) => {
  const { unsignedTx, signature: compiledSignature } = tx
  if (skipBroadcast) {
    const rpcClient = getSuiClient()

    const dryRunResult = await rpcClient.dryRunTransactionBlock({
      transactionBlock: unsignedTx,
    })

    return { txHash: dryRunResult.effects.transactionDigest }
  }

  const rpcClient = getSuiClient()

  const { digest } = await rpcClient.executeTransactionBlock({
    transactionBlock: unsignedTx,
    signature: [compiledSignature],
  })

  return { txHash: digest }
}
