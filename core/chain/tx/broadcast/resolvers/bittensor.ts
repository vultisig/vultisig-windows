import { OtherChain } from '@core/chain/Chain'
import { bittensorRpcUrl } from '@core/chain/chains/bittensor/client'
import { ensureHexPrefix } from '@lib/utils/hex/ensureHexPrefix'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { BroadcastTxResolver } from '../resolver'

type RpcResponse = {
  result?: string
  error?: { code: number; message: string }
}

export const broadcastBittensorTx: BroadcastTxResolver<
  OtherChain.Bittensor
> = async ({ tx: { encoded } }) => {
  const hexWithPrefix = ensureHexPrefix(Buffer.from(encoded).toString('hex'))

  const response = await queryUrl<RpcResponse>(bittensorRpcUrl, {
    body: {
      jsonrpc: '2.0',
      method: 'author_submitExtrinsic',
      params: [hexWithPrefix],
      id: 1,
    },
  })

  if (response.error) {
    // "Already Imported" means another device already broadcast this tx — not an error
    if (response.error.message.includes('Already Imported')) {
      return
    }
    throw new Error(`Bittensor broadcast failed: ${response.error.message}`)
  }
}
