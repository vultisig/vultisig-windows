import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { useMemo } from 'react'

import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import type { ChainAction } from '../ChainAction'
import { depositActionPolicies } from '../depositActionPolicies'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useDepositCoinOptions } from './useDepositCoinOptions'

export function useCorrectSelectedCoin(action: ChainAction): {
  correctedCoin: AccountCoin | undefined
  isReady: boolean
} {
  const [selected] = useDepositCoin()
  const allCoins = useCurrentVaultCoins()
  const chain = selected?.chain
  const { options, isReady } = useDepositCoinOptions(action)

  const correctedCoin = useMemo(() => {
    const correct = depositActionPolicies[action].correct
    if (!correct) return selected
    return correct({ action, allCoins, selected, options, chain })
  }, [action, allCoins, selected, options, chain])

  return { correctedCoin, isReady }
}
