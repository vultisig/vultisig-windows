import { CosmosChain } from '@core/chain/Chain'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { attempt } from '@lib/utils/attempt'
import { isInError } from '@lib/utils/error/isInError'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { sha256 } from 'viem'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeCosmosTx: ExecuteTxResolver<CosmosChain> = async ({
  chain,
  tx,
  skipBroadcast,
}) => {
  const { serialized } = tx

  const rawTx = serialized
  const parsedData = JSON.parse(rawTx)
  const txBytes = parsedData.tx_bytes
  const decodedTxBytes = Buffer.from(txBytes, 'base64')

  const txHash = stripHexPrefix(sha256(decodedTxBytes).toUpperCase())
  if (skipBroadcast) return { txHash, encoded: serialized }
  const client = await getCosmosClient(chain)
  const result = attempt(client.broadcastTx(decodedTxBytes))

  if (
    'error' in result &&
    !isInError(result.error, 'tx already exists in cache')
  ) {
    throw result.error
  }

  return { txHash, encoded: serialized }
}
