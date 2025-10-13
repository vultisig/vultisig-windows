import { getEvmClient } from '@core/chain/chains/evm/client'

import { KeysignTxDataResolver } from '../resolver'

export const getEvmTxData: KeysignTxDataResolver<'evm'> = async ({
  coin: { chain, address },
}) => {
  const client = getEvmClient(chain)

  const nonce = BigInt(
    await client.getTransactionCount({
      address: address as `0x${string}`,
    })
  )

  return { nonce }
}
