import { areEqualCoins, CoinKey } from '@core/chain/coin/Coin'
import { isExtensionEnv } from '@core/ui/utils/isExtensionEnv'
import { getPersistentStateProviderSetup } from '@core/ui/vault/persistent/getPersistentStateProviderSetup'
import { useCurrentVaultNativeCoins } from '@core/ui/vault/state/currentVaultCoins'
import { ChildrenProp } from '@lib/ui/props'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'
import { useMemo } from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useAssertCurrentVaultId } from '../../../storage/currentVaultId'

const providerSetup = isExtensionEnv()
  ? getPersistentStateProviderSetup<CoinKey>(
      'ToCoin',
      (vaultId?: string) => `swap_to_coin_${vaultId}`
    )
  : getStateProviderSetup<CoinKey>('ToCoin')

const { useState: useToCoin, provider: ToCoinInternalProvider } = providerSetup

export { useToCoin }

export const ToCoinProvider: React.FC<ChildrenProp> = ({ children }) => {
  const [{ coin: fromCoin }] = useCoreViewState<'swap'>()
  const currentVaultId = useAssertCurrentVaultId()

  const nativeCoins = useCurrentVaultNativeCoins()

  const initialValue = useMemo(() => {
    return (
      nativeCoins.find(coin => !areEqualCoins(coin, fromCoin)) ?? nativeCoins[0]
    )
  }, [fromCoin, nativeCoins])

  return (
    <ToCoinInternalProvider
      initialValue={initialValue}
      vaultId={currentVaultId}
    >
      {children}
    </ToCoinInternalProvider>
  )
}
