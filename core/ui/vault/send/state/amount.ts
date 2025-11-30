import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useCallback, useMemo } from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoins } from '../../state/currentVaultCoins'

export const useSendAmount = () => {
  const [state, setState] = useCoreViewState<'send'>()
  const coins = useCurrentVaultCoins()

  const chain = 'fromChain' in state ? state.fromChain : state.coin.chain

  const coin = useMemo(() => {
    const coinKey =
      'coin' in state ? state.coin : { chain, id: chainFeeCoin[chain].id }

    return shouldBePresent(coins.find(coin => areEqualCoins(coin, coinKey)))
  }, [chain, coins, state])

  const amount = useMemo(() => {
    if (!state.amount) {
      return null
    }

    try {
      const amountNumber = parseFloat(state.amount)
      if (isNaN(amountNumber)) {
        return null
      }
      return toChainAmount(amountNumber, coin.decimals)
    } catch {
      return null
    }
  }, [state.amount, coin.decimals])

  const setAmount = useCallback(
    (newAmount: bigint | null | ((prev: bigint | null) => bigint | null)) => {
      setState(prev => {
        const resolvedAmount =
          typeof newAmount === 'function' ? newAmount(amount) : newAmount

        return {
          ...prev,
          amount:
            resolvedAmount === null
              ? undefined
              : fromChainAmount(resolvedAmount, coin.decimals).toString(),
        }
      })
    },
    [setState, amount, coin.decimals]
  )

  return [amount, setAmount] as const
}
