import { OtherChain } from '@core/chain/Chain'
import { getPolkadotClient } from '@core/chain/chains/polkadot/client'
import { attempt } from '@lib/utils/attempt'
import { isInError } from '@lib/utils/error/isInError'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executePolkadotTx: ExecuteTxResolver<
  OtherChain.Polkadot
> = async ({ walletCore, tx, skipBroadcast }) => {
  const rawTx = walletCore.HexCoding.encode(tx.encoded)
  const client = await getPolkadotClient()
  const txHash = client
    .createType('Extrinsic', rawTx, {
      isSigned: true,
      version: 4,
    })
    .hash.toHex()

  console.log('txHash: ', txHash)

  if (skipBroadcast) {
    return { txHash }
  }

  const { error } = await attempt(client.rpc.author.submitExtrinsic(rawTx))
  if (error && !isInError(error, 'Transaction is temporarily banned')) {
    throw error
  }

  return { txHash }
}
