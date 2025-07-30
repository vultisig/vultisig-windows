import { OtherChain } from '@core/chain/Chain'
import { getRippleClient } from '@core/chain/chains/ripple/client'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'

import { BroadcastTxResolver } from './BroadcastTxResolver'

export const broadcastRippleTx: BroadcastTxResolver<
  OtherChain.Ripple
> = async ({ walletCore, tx }) => {
  const rawTx = stripHexPrefix(walletCore.HexCoding.encode(tx.encoded))
  const client = await getRippleClient()

  await client.request({
    command: 'submit',
    tx_blob: rawTx,
  })
}
