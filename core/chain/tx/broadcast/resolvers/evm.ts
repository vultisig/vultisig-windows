import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { attempt } from '@lib/utils/attempt'
import { isInError } from '@lib/utils/error/isInError'
import { ensureHexPrefix } from '@lib/utils/hex/ensureHexPrefix'

import { BroadcastTxResolver } from '../resolver'

export const broadcastEvmTx: BroadcastTxResolver<EvmChain> = async ({
  chain,
  tx,
}) => {
  const client = getEvmClient(chain)

  const { error } = await attempt(
    client.sendRawTransaction({
      serializedTransaction: ensureHexPrefix(
        Buffer.from(tx.encoded).toString('hex')
      ),
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
      'could not replace existing tx',
      'tx already in mempool'
    )
  ) {
    throw error
  }
}
