import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { attempt } from '@lib/utils/attempt'

import { TxStatusResolver } from '../resolver'

export const getEvmTxStatus: TxStatusResolver<EvmChain> = async ({
  chain,
  hash,
}) => {
  const client = getEvmClient(chain)

  const { data, error } = await attempt(
    client.getTransactionReceipt({ hash: hash as `0x${string}` })
  )

  if (error) {
    return 'pending'
  }

  if (!data) {
    return 'pending'
  }

  return data.status === 'success' ? 'success' : 'error'
}
