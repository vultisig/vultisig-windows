import { getSolanaClient } from '@core/chain/chains/solana/client'
import { Address } from '@solana/web3.js'

type Input = {
  account: string
  token: string
}

export const getSplAssociatedAccount = async ({
  account,
  token,
}: Input): Promise<Address> => {
  const client = getSolanaClient()

  const { value } = await client
    .getTokenAccountsByOwner(
      account as Address,
      {
        mint: token as Address,
      },
      {
        encoding: 'jsonParsed',
      }
    )
    .send()

  if (!value) {
    throw new Error('No associated token account found')
  }

  return value[0].pubkey
}
