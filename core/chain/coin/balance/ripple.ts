import { getRippleAccountInfo } from '@core/chain/chains/ripple/account/getRippleAccountInfo'

import { CoinBalanceResolver } from './CoinBalanceResolver'

export const getRippleCoinBalance: CoinBalanceResolver = async input => {
  const { Balance } = await getRippleAccountInfo(input.address)

  return BigInt(Balance)
}
