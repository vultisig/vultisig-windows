import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { attempt } from '@lib/utils/attempt'
import { isInError } from '@lib/utils/error/isInError'

import { BroadcastTxResolver } from './BroadcastTxResolver'

export const broadcastEvmTx: BroadcastTxResolver<EvmChain> = async ({
  walletCore,
  chain,
  tx,
}) => {
  const rawTx = walletCore.HexCoding.encode(tx.encoded)
  const client = getEvmClient(chain)

  const { error } = await attempt(
    client.sendRawTransaction({
      serializedTransaction: rawTx as `0x${string}`,
    })
  )

  if (
    error &&
    !isInError(
      error,
      'already known',
      'transaction is temporarily banned',
      'nonce too low',
      'transaction already exists',
      'future transaction tries to replace pending',
      'could not replace existing tx'
    )
  ) {
    throw error
  }
}
