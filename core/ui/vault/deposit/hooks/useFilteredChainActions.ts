import { Chain } from '@core/chain/Chain'
import { knownTokens } from '@core/chain/coin/knownTokens'
import { DepositEnabledChain } from '@core/ui/vault/deposit/DepositEnabledChain'
import { useMemo } from 'react'

import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { ChainAction, chainActionsRecord } from '../ChainAction'

const rujiAction: ChainAction[] = [
  'stake_ruji',
  'unstake_ruji',
  'withdraw_ruji_rewards',
]

export const useFilteredChainActions = (chain: DepositEnabledChain) => {
  const actionsForCurrentChain = chainActionsRecord[chain]
  const rujiCoin = useCurrentVaultCoins().find(
    coin =>
      coin.id ===
      knownTokens[Chain.THORChain].find(t => t.ticker === 'RUJI')?.id
  )

  return useMemo(() => {
    return actionsForCurrentChain.filter(action => {
      if (!rujiCoin && rujiAction.includes(action)) {
        return false
      }

      return true
    })
  }, [actionsForCurrentChain, rujiCoin])
}
