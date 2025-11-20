import { CosmosChain } from '@core/chain/Chain'
import { parseCosmosSerialized } from '@core/chain/chains/cosmos/utils/parseCosmosSerialized'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { sha256 } from 'viem'

import { TxHashResolver } from '../resolver'

export const getCosmosTxHash: TxHashResolver<CosmosChain> = output => {
  const serialized =
    'serialized' in output && output.serialized
      ? output.serialized
      : 'json' in output && output.json
        ? output.json
        : undefined

  const { tx_bytes } = parseCosmosSerialized(serialized)
  if (!tx_bytes) {
    throw new Error('tx_bytes is undefined after parsing')
  }
  const decodedTxBytes = Buffer.from(tx_bytes, 'base64')

  return stripHexPrefix(sha256(decodedTxBytes).toUpperCase())
}
