import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { Address } from '@solana/web3.js'

import { getSolanaClient } from '../../chains/solana/client'
import { getSplAccounts } from '../../chains/solana/spl/getSplAccounts'
import { CoinBalanceResolver } from './CoinBalanceResolver'

export const getSolanaCoinBalance: CoinBalanceResolver = async input => {
  const client = getSolanaClient()

  if (isFeeCoin(input)) {
    const { value } = await client.getBalance(input.address as Address).send()

    return value.valueOf()
  }

  const accounts = await getSplAccounts(input.address)

  const tokenAccount = accounts.find(
    account => account.account.data.parsed.info.mint === input.id
  )

  const tokenAmount =
    tokenAccount?.account?.data?.parsed?.info?.tokenAmount?.amount

  return BigInt(tokenAmount ?? 0)
}
