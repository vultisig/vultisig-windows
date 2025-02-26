import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { CoinBalanceResolver } from './CoinBalanceResolver'

interface PolkadotAccountBalance {
  data: {
    account: {
      balance: number
    }
  }
}

export const getPolkadotCoinBalance: CoinBalanceResolver = async input => {
  const { data } = await queryUrl<PolkadotAccountBalance>(
    'https://polkadot.api.subscan.io/api/v2/scan/search',
    {
      method: 'POST',
      body: JSON.stringify({ key: input.address }),
    }
  )

  return toChainAmount(
    data.account.balance,
    chainFeeCoin[Chain.Polkadot].decimals
  )
}
