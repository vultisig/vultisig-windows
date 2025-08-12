import { OtherChain } from '@core/chain/Chain'
import { getSuiClient } from '@core/chain/chains/sui/client'

import { TxHashResolver } from '../resolver'

export const getSuiTxHash: TxHashResolver<OtherChain.Sui> = async ({
  unsignedTx,
}) => {
  const client = getSuiClient()

  const {
    effects: { transactionDigest },
  } = await client.dryRunTransactionBlock({
    transactionBlock: unsignedTx,
  })

  return transactionDigest
}
