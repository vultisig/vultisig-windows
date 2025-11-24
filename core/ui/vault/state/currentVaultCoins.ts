import { Chain } from '@core/chain/Chain'
import { areEqualCoins, CoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { groupItems } from '@lib/utils/array/groupItems'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMemo } from 'react'

import { useCurrentVault } from './currentVault'

export const useCurrentVaultCoins = () => {
  const { coins } = useCurrentVault()

  return coins ?? []
}

export const useCurrentVaultNativeCoins = () => {
  const coins = useCurrentVaultCoins()

  return useMemo(() => coins.filter(isFeeCoin), [coins])
}

export const useCurrentVaultChains = () => {
  const nativeCoins = useCurrentVaultNativeCoins()

  return useMemo(() => nativeCoins.map(coin => coin.chain), [nativeCoins])
}

export const useCurrentVaultCoinsByChain = () => {
  const coins = useCurrentVaultCoins()

  return useMemo(() => {
    return groupItems(coins, coin => coin.chain as Chain)
  }, [coins])
}

export const useCurrentVaultAddresses = () => {
  const coins = useCurrentVaultNativeCoins()

  return useMemo(() => {
    return Object.fromEntries(
      coins.map(coin => [coin.chain, coin.address])
    ) as Record<Chain, string>
  }, [coins])
}

export const useCurrentVaultAddress = (chain: Chain) => {
  const addresses = useCurrentVaultAddresses()
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()

  return useMemo(() => {
    const existing = addresses[chain]
    if (existing) return existing

    const publicKey = getPublicKey({
      chain,
      walletCore,
      hexChainCode: vault.hexChainCode,
      publicKeys: vault.publicKeys,
    })

    return deriveAddress({ chain, publicKey, walletCore })
  }, [addresses, chain, walletCore, vault])
}

export const useCurrentVaultChainCoins = (chain: string) => {
  const coins = useCurrentVaultCoins()

  return useMemo(
    () => coins.filter(coin => coin.chain === chain),
    [chain, coins]
  )
}

export const useCurrentVaultCoin = (coinKey: CoinKey) => {
  const coins = useCurrentVaultCoins()

  return shouldBePresent(coins.find(coin => areEqualCoins(coin, coinKey)))
}
