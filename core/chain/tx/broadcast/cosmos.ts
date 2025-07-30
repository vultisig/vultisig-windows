import { CosmosChain } from '@core/chain/Chain'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { attempt } from '@lib/utils/attempt'
import { isInError } from '@lib/utils/error/isInError'

import { BroadcastTxResolver } from './BroadcastTxResolver'

export const broadcastCosmosTx: BroadcastTxResolver<CosmosChain> = async ({
  chain,
  tx,
}) => {
  const rawTx = tx.serialized
  const parsedData = JSON.parse(rawTx)
  const txBytes = parsedData.tx_bytes
  const decodedTxBytes = Buffer.from(txBytes, 'base64')

  const client = await getCosmosClient(chain)
  const result = attempt(client.broadcastTx(decodedTxBytes))

  if (
    'error' in result &&
    !isInError(result.error, 'tx already exists in cache')
  ) {
    throw result.error
  }
}
