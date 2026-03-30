import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'

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
