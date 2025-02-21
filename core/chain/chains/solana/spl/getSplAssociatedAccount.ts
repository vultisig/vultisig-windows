import { getSolanaClient } from '@core/chain/chains/solana/client'
import { Address } from '@solana/web3.js'

type Input = {
  account: string
  token: string
}

export const getSplAssociatedAccount = async ({
  account,
  token,
}: Input): Promise<{ address: Address; isToken2022: boolean }> => {
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

  const isToken2022 =
    value[0].account.owner == 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'

  return {
    address: value[0].pubkey,
    isToken2022: isToken2022,
  }
}
