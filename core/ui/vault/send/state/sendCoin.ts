import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMemo } from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoins } from '../../state/currentVaultCoins'

export const useCurrentSendCoin = () => {
  const [state] = useCoreViewState<'send'>()

  const chain = 'fromChain' in state ? state.fromChain : state.coin.chain

  const coins = useCurrentVaultCoins()

  return useMemo(() => {
    const coinKey =
      'coin' in state ? state.coin : { chain, id: chainFeeCoin[chain].id }

    return shouldBePresent(coins.find(coin => areEqualCoins(coin, coinKey)))
  }, [chain, coins, state])
}
