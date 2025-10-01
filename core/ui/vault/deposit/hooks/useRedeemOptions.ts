import { Chain } from '@core/chain/Chain'
import { yieldBearingTokensIdToContractMap } from '@core/chain/chains/cosmos/thor/yield-bearing-tokens/config'
import { makeAccountCoin } from '@core/chain/coin/utils/makeAccountCoin'
import { useMemo } from 'react'

import {
  useCurrentVaultAddresses,
  useCurrentVaultCoins,
} from '../../state/currentVaultCoins'

export const useRedeemOptions = () => {
  const coins = useCurrentVaultCoins()
  const address = useCurrentVaultAddresses()[Chain.THORChain]

  return useMemo(() => {
    return Object.keys(yieldBearingTokensIdToContractMap).map(
      id =>
        coins.find(coin => coin.id === id) ||
        makeAccountCoin({ chain: Chain.THORChain, id }, address)
    )
  }, [address, coins])
}
