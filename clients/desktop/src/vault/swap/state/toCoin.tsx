import { areEqualCoins, CoinKey } from '@core/chain/coin/Coin'
import { ChildrenProp } from '@lib/ui/props'
import { useMemo } from 'react'

import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup'
import { useCurrentVaultNativeCoins } from '../../state/currentVault'
import { useFromCoin } from './fromCoin'

const { useState: useToCoin, provider: ToCoinInternalProvider } =
  getStateProviderSetup<CoinKey>('ToCoin')

export { useToCoin }

export const ToCoinProvider: React.FC<ChildrenProp> = ({ children }) => {
  const [fromCoin] = useFromCoin()

  const nativeCoins = useCurrentVaultNativeCoins()

  const initialValue = useMemo(() => {
    return (
      nativeCoins.find(coin => !areEqualCoins(coin, fromCoin)) ?? nativeCoins[0]
    )
  }, [fromCoin, nativeCoins])

  return (
    <ToCoinInternalProvider initialValue={initialValue}>
      {children}
    </ToCoinInternalProvider>
  )
}
