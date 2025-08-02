import { Chain } from '@core/chain/Chain'

import { useCurrentVaultAddress } from '../../../state/currentVaultCoins'
import { useLiquidRUJI } from './useLiquidRuji'
import { useRujiraStakeAndRewards } from './useRujiraStakeAndRewards'

export function useRujiUiBalances() {
  const rujiAddress = useCurrentVaultAddress(Chain.THORChain)
  const liquid = useLiquidRUJI(rujiAddress)
  const stake = useRujiraStakeAndRewards(rujiAddress)

  return {
    stakeLoading: stake.isLoading,
    liquidLoading: liquid.isLoading,
    liquid: Number((liquid.data?.display ?? 0).toFixed(6)),
    bonded: Number((stake.data?.bonded ?? 0).toFixed(6)),
    rewards: Number((stake.data?.pendingUSDC ?? 0).toFixed(4)),
  }
}
