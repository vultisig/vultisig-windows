import { getSolanaClient } from '@core/chain/chains/solana/client'

import { KeysignTxDataResolver } from '../resolver'

export const getSolanaTxData: KeysignTxDataResolver<'solana'> = async () => {
  const client = getSolanaClient()
  const recentBlockHash = (
    await client.getLatestBlockhash().send()
  ).value.blockhash.toString()

  return { recentBlockHash } as any
}
