import { getSplAccounts } from '@core/chain/chains/solana/spl/getSplAccounts'
import { getSolanaToken } from '@core/chain/coin/find/solana/getSolanaToken'

import { FindCoinsResolver } from '../FindCoinsResolver'

export const findSolanaCoins: FindCoinsResolver = async ({ address }) => {
  const accounts = await getSplAccounts(address)
  if (!accounts.length) {
    return []
  }

  const tokenAddresses = accounts.map(
    account => account.account.data.parsed.info.mint
  )

  const tokenPromises = tokenAddresses.map(tokenAddress =>
    getSolanaToken(tokenAddress).then(tokenInfo => ({
      ...tokenInfo,
      address,
    }))
  )

  return Promise.all(tokenPromises)
}
