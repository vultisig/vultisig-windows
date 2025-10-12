import { getSuiClient } from '@core/chain/chains/sui/client'

import { KeysignTxDataResolver } from '../resolver'

export const getSuiTxData: KeysignTxDataResolver = async ({ coin }) => {
  const client = getSuiClient()
  const allCoins = await client.getAllCoins({ owner: coin.address })

  return {
    coins: allCoins.data,
  } as any
}
