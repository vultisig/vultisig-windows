import { CosmosChain } from '@core/chain/Chain'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { sha256 } from 'viem'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeCosmosTx: ExecuteTxResolver<CosmosChain> = async ({
  tx,
}) => {
  const parsedData = JSON.parse(tx.serialized)
  const txBytes = parsedData.tx_bytes
  const decodedTxBytes = Buffer.from(txBytes, 'base64')

  const txHash = stripHexPrefix(sha256(decodedTxBytes).toUpperCase())
  return { txHash, encoded: tx.serialized }
}
