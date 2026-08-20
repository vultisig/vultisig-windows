import { withoutKaminoShareCoins } from '@core/ui/chain/coin/solana/isKaminoShareCoin'
import { withoutBondedRuneReceiptCoins } from '@core/ui/chain/coin/thorchain/isBondedRuneReceiptCoin'
import { withoutRujiStakingReceiptCoins } from '@core/ui/chain/coin/thorchain/isRujiStakingReceiptCoin'
import { withoutThorchainLpCoins } from '@core/ui/chain/coin/thorchain/isThorchainLpCoin'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { areEqualCoins, CoinKey } from '@vultisig/core-chain/coin/Coin'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { getChainAddress } from '@vultisig/core-chain/publicKey/address/getChainAddress'
import { getSignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { isKeyImportVault } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useMemo } from 'react'

import { useCurrentVault } from './currentVault'

// Stable empty fallback so downstream `useMemo` hooks don't bust every render
// when the vault is loaded but its coins list is still undefined.
const emptyCoins: AccountCoin[] = []

export const useCurrentVaultCoins = () => {
  const { coins } = useCurrentVault()

  return coins ?? emptyCoins
}

/**
 * {@link useCurrentVaultCoins} minus DeFi-only entries: the THORChain staking
 * receipts sRUJI and ybRUNE, Rujira LP tokens (`LP-…`), and Kamino Earn share
 * mints. Use for portfolio UX: balances, fiat totals, swap/send pickers,
 * refresh. Those positions are surfaced under their own `DeFi` tabs instead,
 * where they are valued correctly — a share mint has no price feed of its own.
 * Keep {@link useCurrentVaultCoins} for storage-accurate flows (manage tokens,
 * CoinFinder dedupe, resolving a send `coin` key that may still reference a
 * legacy receipt/LP row).
 */
export const usePortfolioVaultCoins = () =>
  withoutKaminoShareCoins(
    withoutThorchainLpCoins(
      withoutBondedRuneReceiptCoins(
        withoutRujiStakingReceiptCoins(useCurrentVaultCoins())
      )
    )
  )

export const usePortfolioVaultChainCoins = (chain: string) =>
  usePortfolioVaultCoins().filter(coin => coin.chain === chain)

export const useCurrentVaultNativeCoins = () => {
  const coins = useCurrentVaultCoins()

  return useMemo(() => coins.filter(isFeeCoin), [coins])
}

export const useCurrentVaultChains = () => {
  const nativeCoins = useCurrentVaultNativeCoins()

  return useMemo(() => nativeCoins.map(coin => coin.chain), [nativeCoins])
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

    // MLDSA chains (e.g. QBTC) can only derive an address from the vault's
    // post-quantum key. Vaults created before MLDSA keygen don't have one, so
    // they simply have no address on these chains — return empty rather than
    // throwing (callers treat '' as "not derivable / disabled").
    if (getSignatureAlgorithm(chain) === 'mldsa' && !vault.publicKeyMldsa) {
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
