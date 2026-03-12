import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
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
    return { status: 'pending' }
  }

  if (!data) {
    return { status: 'pending' }
  }

  const status = data.status === 'success' ? 'success' : 'error'
  const feeCoin = chainFeeCoin[chain]

  const receipt =
    data.gasUsed != null && data.effectiveGasPrice != null
      ? {
          feeAmount: data.gasUsed * data.effectiveGasPrice,
          feeDecimals: feeCoin.decimals,
          feeTicker: feeCoin.ticker,
        }
      : undefined

  return { status, receipt }
}
