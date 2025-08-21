import {
  yieldBearingAssetsIds,
  yieldBearingAssetsReceiptDenoms,
} from '@core/chain/chains/cosmos/thor/yield-bearing-tokens/config'
import { useMemo } from 'react'

import {
  useCurrentVaultAddresses,
  useCurrentVaultCoins,
} from '../../state/currentVaultCoins'
import { createMintUnmintCoin } from '../DepositForm/ActionSpecific/MintUnmintSpecific/utils'
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
        return coinById.get(denom) ?? createMintUnmintCoin(denom, address)
      }),
    [coinById, address]
  )
}
