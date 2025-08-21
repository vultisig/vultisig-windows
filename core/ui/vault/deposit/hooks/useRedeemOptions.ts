import { Chain } from '@core/chain/Chain'
import {
  yieldBearingAssetsIds,
  yieldBearingAssetsReceiptDenoms,
} from '@core/chain/chains/cosmos/thor/yield-bearing-tokens/config'
import { makeAccountCoin } from '@core/chain/coin/utils/makeAccountCoin'
import { useMemo } from 'react'

import {
  useCurrentVaultAddresses,
  useCurrentVaultCoins,
} from '../../state/currentVaultCoins'
import { useDepositCoin } from '../providers/DepositCoinProvider'

export const useRedeemOptions = () => {
  const [selectedCoin] = useDepositCoin()

  const coins = useCurrentVaultCoins()
  const coinById = useMemo(() => new Map(coins.map(c => [c.id, c])), [coins])
  const address = useCurrentVaultAddresses()[selectedCoin.chain]

  return useMemo(
    () =>
      yieldBearingAssetsIds.map(asset => {
        const denom = yieldBearingAssetsReceiptDenoms[asset]
        return (
          coinById.get(denom) ??
          makeAccountCoin({ chain: Chain.THORChain, id: denom }, address)
        )
      }),
    [coinById, address]
  )
}
