import { Chain } from '@core/chain/Chain'
import { kujiraCoinsOnThorChain } from '@core/chain/chains/cosmos/thor/kujira-merge/kujiraCoinsOnThorChain'
import { useMemo } from 'react'

import { useCurrentVaultChainCoins } from '../../state/currentVaultCoins'

export const useMergeOptions = () => {
  const thorChainCoins = useCurrentVaultChainCoins(Chain.THORChain)

  return useMemo(
    () =>
      thorChainCoins.filter(
        coin => coin.id && coin.id in kujiraCoinsOnThorChain
      ),
    [thorChainCoins]
  )
}
