import { Chain, CosmosChain } from '@core/chain/Chain'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { attempt } from '@lib/utils/attempt'
import { isInError } from '@lib/utils/error/isInError'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { BroadcastTxResolver } from '../resolver'

/**
 * Chains where StargateClient broadcast fails due to incompatible
 * pubkey types (e.g. MLDSA). Use Cosmos REST API instead.
 */
const restOnlyChains: CosmosChain[] = [Chain.QBTC]

type RestBroadcastResponse = {
  tx_response: {
    code: number
    txhash: string
    raw_log: string
  }
}

/** Broadcasts a tx via the Cosmos REST API (`/cosmos/tx/v1beta1/txs`). */
const broadcastCosmosRestTx = async (
  chain: CosmosChain,
  serialized: string
) => {
  const url = `${cosmosRpcUrl[chain]}/cosmos/tx/v1beta1/txs`
  const response = await queryUrl<RestBroadcastResponse>(url, {
    body: serialized,
  })

  const { code, raw_log } = response.tx_response
  if (code !== 0) {
    throw new Error(`Broadcast failed (code ${code}): ${raw_log}`)
  }
}

export const broadcastCosmosTx: BroadcastTxResolver<CosmosChain> = async ({
  chain,
  tx: { serialized },
}) => {
  if (restOnlyChains.includes(chain)) {
    const { error } = await attempt(() =>
      broadcastCosmosRestTx(chain, serialized)
    )
    if (error && !isInError(error, 'tx already exists in cache')) {
      throw error
    }
    return
  }

  const { tx_bytes } = JSON.parse(serialized)
  const decodedTxBytes = Buffer.from(tx_bytes, 'base64')

  const client = await getCosmosClient(chain)
  const { error } = await attempt(client.broadcastTx(decodedTxBytes))

  if (error && !isInError(error, 'tx already exists in cache')) {
    throw error
  }
}
