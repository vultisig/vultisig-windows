import { OtherChain } from '@core/chain/Chain'
import { getSuiClient } from '@core/chain/chains/sui/client'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeSuiTx: ExecuteTxResolver<OtherChain.Sui> = async ({
  tx,
}) => {
  const rpcClient = getSuiClient()

  const dryRunResult = await rpcClient.dryRunTransactionBlock({
    transactionBlock: tx.unsignedTx,
  })

  return { txHash: dryRunResult.effects.transactionDigest }
}
