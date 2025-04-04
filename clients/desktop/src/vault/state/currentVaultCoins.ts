import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { areEqualCoins, CoinKey } from '@core/chain/coin/Coin'
import { isNativeCoin } from '@core/chain/coin/utils/isNativeCoin'
import { groupItems } from '@lib/utils/array/groupItems'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMemo } from 'react'

import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const {
  useValue: useCurrentVaultCoins,
  provider: CurrentVaultCoinsProvider,
} = getValueProviderSetup<AccountCoin[]>('CurrentVaultCoins')

export const useCurrentVaultNativeCoins = () => {
  const coins = useCurrentVaultCoins()

  return useMemo(() => coins.filter(isNativeCoin), [coins])
}

export const useCurrentVaultChainIds = () => {
  const coins = useCurrentVaultNativeCoins()

  return useMemo(
    () => withoutDuplicates(coins.map(coin => coin.chain)),
    [coins]
  )
}

export const useCurrentVaultCoinsByChain = () => {
  const coins = useCurrentVaultCoins()

  return useMemo(() => {
    return groupItems(coins, coin => coin.chain as Chain)
  }, [coins])
}

export const useCurrentVaultAddreses = () => {
  const coins = useCurrentVaultNativeCoins()

  return useMemo(() => {
    return Object.fromEntries(
      coins.map(coin => [coin.chain, coin.address])
    ) as Record<Chain, string>
  }, [coins])
}

export const useCurrentVaultAddress = (chain: string) => {
  const addresses = useCurrentVaultAddreses()

  return shouldBePresent(addresses[chain as Chain])
}

export const useCurrentVaultChainCoins = (chain: string) => {
  const coins = useCurrentVaultCoins()

  return useMemo(
    () => coins.filter(coin => coin.chain === chain),
    [chain, coins]
  )
}

export const useCurrentVaultNativeCoin = (chain: string) => {
  const nativeCoins = useCurrentVaultNativeCoins()

  return shouldBePresent(nativeCoins.find(coin => coin.chain === chain))
}

export const useCurrentVaultCoin = (coinKey: CoinKey) => {
  const coins = useCurrentVaultCoins()

  return shouldBePresent(coins.find(coin => areEqualCoins(coin, coinKey)))
}
