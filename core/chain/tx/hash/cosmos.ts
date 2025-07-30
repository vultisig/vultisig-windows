import { CosmosChain } from '@core/chain/Chain'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { sha256 } from 'viem'

import { GetTxHashResolver } from './GetTxHashResolver'

export const getCosmosTxHash: GetTxHashResolver<CosmosChain> = ({
  serialized,
}) => {
  const { tx_bytes } = JSON.parse(serialized)
  const decodedTxBytes = Buffer.from(tx_bytes, 'base64')

  return stripHexPrefix(sha256(decodedTxBytes).toUpperCase())
}
