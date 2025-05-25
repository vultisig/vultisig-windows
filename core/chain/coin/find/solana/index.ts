import { getSplAccounts } from '@core/chain/chains/solana/spl/getSplAccounts'
import { getSolanaToken } from '@core/chain/coin/find/solana/getSolanaToken'
import { withoutUndefined } from '@lib/utils/array/withoutUndefined'
import { attempt } from '@lib/utils/attempt'

import { FindCoinsResolver } from '../FindCoinsResolver'

export const findSolanaCoins: FindCoinsResolver = async ({ address }) => {
  const accounts = await getSplAccounts(address)

  const tokenAddresses = accounts.map(
    account => account.account.data.parsed.info.mint
  )

  const result = await Promise.all(
    tokenAddresses.map(async tokenAddress => {
      const { data } = await attempt(getSolanaToken(tokenAddress))

      if (data) {
        return { ...data, address }
      }
    })
  )

  return withoutUndefined(result)
}
