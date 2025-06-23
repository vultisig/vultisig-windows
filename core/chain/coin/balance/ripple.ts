import { getRippleAccountInfo } from '@core/chain/chains/ripple/account/getRippleAccountInfo'
import { attempt } from '@lib/utils/attempt'
import { isInError } from '@lib/utils/error/isInError'

import { CoinBalanceResolver } from './CoinBalanceResolver'

export const getRippleCoinBalance: CoinBalanceResolver = async input => {
  const result = await attempt(getRippleAccountInfo(input.address))

  if ('error' in result) {
    if (isInError(result.error, 'Account not found')) {
      return BigInt(0)
    }

    throw result.error
  }

  const { account_data } = result.data

  return BigInt(account_data.Balance)
}
