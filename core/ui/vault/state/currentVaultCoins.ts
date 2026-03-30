import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { Chain } from '@vultisig/core-chain/Chain'
import { areEqualCoins, CoinKey } from '@vultisig/core-chain/coin/Coin'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { isKeyImportVault } from '@vultisig/core-mpc/vault/Vault'
import { groupItems } from '@vultisig/lib-utils/array/groupItems'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useMemo } from 'react'

import { getChainAddress } from '../../utils/getChainAddress'
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

const knownChains = Object.values(Chain) as string[]

export const useCurrentVaultCoinsByChain = () => {
  const coins = useCurrentVaultCoins()

  return useMemo(() => {
    const supported = coins.filter(coin => isOneOf(coin.chain, knownChains))
    return groupItems(supported, coin => coin.chain as Chain)
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

    if (isKeyImportVault(vault) && !vault.chainPublicKeys?.[chain]) {
      return ''
    }

    return getChainAddress({
      chain,
      walletCore,
      hexChainCode: vault.hexChainCode,
      publicKeys: vault.publicKeys,
      publicKeyMldsa: vault.publicKeyMldsa,
      chainPublicKeys: vault.chainPublicKeys,
    })
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
