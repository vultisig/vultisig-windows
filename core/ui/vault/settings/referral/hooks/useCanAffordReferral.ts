import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/feeQuote/getFeeAmount'

import { useBalanceQuery } from '../../../../chain/coin/queries/useBalanceQuery'
import { useCurrentVaultCoin } from '../../../state/currentVaultCoins'
import { useReferralFeeQuoteQuery } from '../queries/useReferralFeeQuoteQuery'

export const useCanAffordReferral = (requestedRune = 0) => {
  const runeCoin = useCurrentVaultCoin(chainFeeCoin.THORChain)
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(runeCoin))
  const { data: feeQuote } = useReferralFeeQuoteQuery()

  const balanceRune = balanceQuery.data
    ? fromChainAmount(balanceQuery.data, runeCoin.decimals)
    : 0

  const chainFeeAmount = feeQuote ? getFeeAmount(runeCoin.chain, feeQuote) : 0
  const feeAmount = fromChainAmount(chainFeeAmount, runeCoin.decimals)
  const totalRequired = requestedRune + feeAmount

  return balanceRune >= totalRequired
}
