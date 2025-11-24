import { OtherChain } from '@core/chain/Chain'
import { ensureHexPrefix } from '@lib/utils/hex/ensureHexPrefix'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { polkadotRpcUrl } from '../../../chains/polkadot/client'
import { BroadcastTxResolver } from '../resolver'

export const broadcastPolkadotTx: BroadcastTxResolver<
  OtherChain.Polkadot
> = async ({ tx: { encoded } }) => {
  const hexWithPrefix = ensureHexPrefix(Buffer.from(encoded).toString('hex'))

  await queryUrl(polkadotRpcUrl, {
    body: {
      jsonrpc: '2.0',
      method: 'author_submitExtrinsic',
      params: [hexWithPrefix],
      id: 1,
    },
  })
}
