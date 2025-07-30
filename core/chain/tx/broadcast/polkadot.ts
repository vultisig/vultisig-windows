import { OtherChain } from '@core/chain/Chain'
import { getPolkadotClient } from '@core/chain/chains/polkadot/client'
import { attempt } from '@lib/utils/attempt'
import { isInError } from '@lib/utils/error/isInError'

import { BroadcastTxResolver } from './BroadcastTxResolver'

export const broadcastPolkadotTx: BroadcastTxResolver<
  OtherChain.Polkadot
> = async ({ walletCore, tx }) => {
  const rawTx = walletCore.HexCoding.encode(tx.encoded)
  const client = await getPolkadotClient()

  const { error } = await attempt(client.rpc.author.submitExtrinsic(rawTx))
  if (error && !isInError(error, 'Transaction is temporarily banned')) {
    throw error
  }
}
