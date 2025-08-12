import { OtherChain } from '@core/chain/Chain'
import { getRippleClient } from '@core/chain/chains/ripple/client'

import { BroadcastTxResolver } from '../resolver'

export const broadcastRippleTx: BroadcastTxResolver<
  OtherChain.Ripple
> = async ({ tx: { encoded } }) => {
  const client = await getRippleClient()

  await client.request({
    command: 'submit',
    tx_blob: Buffer.from(encoded).toString('hex'),
  })
}
