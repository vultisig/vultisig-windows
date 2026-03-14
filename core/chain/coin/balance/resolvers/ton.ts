import { getTonAccountInfo } from '@core/chain/chains/ton/account/getTonAccountInfo'
import { getJettonBalance } from '@core/chain/chains/ton/api'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { bigIntMax } from '@lib/utils/bigint/bigIntMax'

import { CoinBalanceResolver } from '../resolver'

export const getTonCoinBalance: CoinBalanceResolver = async input => {
  if (isFeeCoin(input)) {
    const { balance } = await getTonAccountInfo(input.address)
    return bigIntMax(BigInt(balance), BigInt(0))
  }

  return getJettonBalance({
    ownerAddress: input.address,
    jettonMasterAddress: shouldBePresent(input.id),
  })
}
