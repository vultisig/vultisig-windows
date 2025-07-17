import { areEqualCoins, CoinKey } from '@core/chain/coin/Coin'
import { useCurrentVaultNativeCoins } from '@core/ui/vault/state/currentVaultCoins'
import { ChildrenProp } from '@lib/ui/props'
import { getPersistentStateProviderSetup } from '@lib/ui/state/getPersistentStateProviderSetup'
import { useMemo } from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'

const getKey = (vaultId?: string) => `swap_to_coin_${vaultId ?? 'unknown'}`

const { useState: useToCoin, provider: ToCoinInternalProvider } =
  getPersistentStateProviderSetup<CoinKey>('ToCoin', getKey)

export { useToCoin }

export const ToCoinProvider: React.FC<ChildrenProp & { vaultId?: string }> = ({
  children,
  vaultId,
}) => {
  const [{ coin: fromCoin }] = useCoreViewState<'swap'>()

  const nativeCoins = useCurrentVaultNativeCoins()

  const initialValue = useMemo(() => {
    return (
      nativeCoins.find(coin => !areEqualCoins(coin, fromCoin)) ?? nativeCoins[0]
    )
  }, [fromCoin, nativeCoins])

  return (
    <ToCoinInternalProvider initialValue={initialValue} vaultId={vaultId}>
      {children}
    </ToCoinInternalProvider>
  )
}
