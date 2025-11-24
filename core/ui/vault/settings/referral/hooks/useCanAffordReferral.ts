import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

import { useBalanceQuery } from '../../../../chain/coin/queries/useBalanceQuery'
import { useCurrentVaultCoin } from '../../../state/currentVaultCoins'

export const useCanAffordReferral = (requestedRune = 0) => {
  const runeCoin = useCurrentVaultCoin(chainFeeCoin.THORChain)
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(runeCoin))

  const balanceRune = balanceQuery.data
    ? fromChainAmount(balanceQuery.data, runeCoin.decimals)
    : 0

  return balanceRune >= requestedRune
}
