import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { extractCoinKey } from '@vultisig/core-chain/coin/Coin'

import { rescaleChainAmount } from '../../../chain/utils/rescaleChainAmount'
import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentSendCoin } from './sendCoin'

/**
 * Switches the coin being sent. Emptying the account is a choice made for one
 * account, so it never carries over to another coin. The amount is kept in
 * base units, so it is re-expressed in the new coin's decimals to keep the
 * number the user typed.
 */
export const useSetSendCoin = () => {
  const [, setViewState] = useCoreViewState<'send'>()
  const coin = useCurrentSendCoin()

  return (nextCoin: AccountCoin) => {
    setViewState(prev => ({
      ...prev,
      coin: extractCoinKey(nextCoin),
      allowDeath: undefined,
      amount:
        prev.amount === undefined
          ? undefined
          : rescaleChainAmount({
              amount: prev.amount,
              fromDecimals: coin.decimals,
              toDecimals: nextCoin.decimals,
            }),
    }))
  }
}
