import { OtherChain } from '@core/chain/Chain'
import { getRippleClient } from '@core/chain/chains/ripple/client'

import { BroadcastTxResolver } from './BroadcastTxResolver'

export const broadcastRippleTx: BroadcastTxResolver<
  OtherChain.Ripple
> = async ({ tx }) => {
  const rawTx = Buffer.from(tx.encoded).toString('hex')
  const client = await getRippleClient()

  await client.request({
    command: 'submit',
    tx_blob: rawTx,
  })
}
