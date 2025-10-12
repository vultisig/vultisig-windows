import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'

import { KeysignTxDataResolver } from '../resolver'

export const getEvmTxData: KeysignTxDataResolver<'evm'> = async ({ coin }) => {
  const client = getEvmClient(coin.chain as EvmChain)

  const nonce = BigInt(
    await client.getTransactionCount({
      address: coin.address as `0x${string}`,
    })
  )

  return { nonce }
}
