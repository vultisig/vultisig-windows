import { getSolanaClient } from '@core/chain/chains/solana/client'
import { getSplAssociatedAccount } from '@core/chain/chains/solana/spl/getSplAssociatedAccount'
import { attempt } from '@lib/utils/attempt'

import { SolanaKeysignTxData } from '../core'
import { KeysignTxDataResolver } from '../resolver'

export const getSolanaTxData: KeysignTxDataResolver<'solana'> = async ({
  coin,
  receiver,
}) => {
  const client = getSolanaClient()

  const recentBlockHash = (
    await client.getLatestBlockhash().send()
  ).value.blockhash.toString()

  const result: SolanaKeysignTxData = {
    recentBlockHash,
  }

  if (coin.id) {
    const fromAccount = await getSplAssociatedAccount({
      account: coin.address,
      token: coin.id,
    })
    result.fromTokenAssociatedAddress = fromAccount.address
    const { data } = await attempt(
      getSplAssociatedAccount({
        account: receiver,
        token: coin.id,
      })
    )
    if (data) {
      result.toTokenAssociatedAddress = data.address
      result.programId = data.isToken2022
    }
  }

  return result
}
