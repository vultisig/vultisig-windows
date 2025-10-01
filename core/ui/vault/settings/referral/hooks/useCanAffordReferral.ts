import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'

import { useBalanceQuery } from '../../../../chain/coin/queries/useBalanceQuery'
import { useChainSpecificQuery } from '../../../../chain/coin/queries/useChainSpecificQuery'
import { useCurrentVaultCoin } from '../../../state/currentVaultCoins'

export const useCanAffordReferral = (requestedRune = 0) => {
  const runeCoin = useCurrentVaultCoin(chainFeeCoin.THORChain)
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(runeCoin))
  const { data: chainSpecific } = useChainSpecificQuery({
    coin: runeCoin,
    isDeposit: true,
  })

  const balanceRune = balanceQuery.data
    ? fromChainAmount(balanceQuery.data, runeCoin.decimals)
    : 0

  const chainFeeAmount = chainSpecific ? getFeeAmount(chainSpecific) : 0
  const feeAmount = fromChainAmount(chainFeeAmount, runeCoin.decimals)
  const totalRequired = requestedRune + feeAmount

  return balanceRune >= totalRequired
}
