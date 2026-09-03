import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'
import { WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { TonWalletVersion } from '@vultisig/core-chain/chains/ton/wallet'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { getChainAddress } from '@vultisig/core-chain/publicKey/address/getChainAddress'
import {
  getVaultId,
  isKeyImportVault,
  Vault,
} from '@vultisig/core-mpc/vault/Vault'
import { shouldBeDefined } from '@vultisig/lib-utils/assert/shouldBeDefined'

import { useCore } from '../state/core'
import { CoinsStorage } from './coins'
import { StorageKey } from './StorageKey'
import { useVaults } from './vaults'

export const isTonW5InitiallyEnabled = false

type SetIsTonW5EnabledFunction = (isTonW5Enabled: boolean) => Promise<void>

type GetIsTonW5EnabledFunction = () => Promise<boolean>

export type TonW5EnabledStorage = {
  getIsTonW5Enabled: GetIsTonW5EnabledFunction
  setIsTonW5Enabled: SetIsTonW5EnabledFunction
}

/**
 * The TON wallet contract the app derives accounts for. W5 is a different
 * address for the same key, so this is a developer opt-in rather than a
 * default: the V4R2 account every existing vault uses stays untouched unless
 * the flag is on.
 */
export const getTonWalletVersion = (
  isTonW5Enabled: boolean
): TonWalletVersion => (isTonW5Enabled ? 'v5r1' : 'v4r2')

export const useIsTonW5EnabledQuery = () => {
  const { getIsTonW5Enabled } = useCore()

  return useQuery({
    queryKey: [StorageKey.isTonW5Enabled],
    queryFn: getIsTonW5Enabled,
    ...noRefetchQueryOptions,
  })
}

export const useIsTonW5Enabled = () => {
  const { data } = useIsTonW5EnabledQuery()

  return shouldBeDefined(data)
}

/** The wallet contract to derive TON addresses for, per the developer option. */
export const useTonWalletVersion = () =>
  getTonWalletVersion(useIsTonW5Enabled())

type MoveTonCoinsToWalletVersionInput = {
  vaults: (Vault & { coins: AccountCoin[] })[]
  walletCore: WalletCore
  tonWalletVersion: TonWalletVersion
  createCoin: CoinsStorage['createCoin']
  deleteCoin: CoinsStorage['deleteCoin']
}

/**
 * Re-homes every vault's TON coins — the native coin and its jettons, whose
 * `address` is the same owner — onto the address the given contract derives.
 * Stored coins carry their address, so the wallet-version flag alone would
 * change nothing that balances or keysign can see.
 */
export const moveTonCoinsToWalletVersion = async ({
  vaults,
  walletCore,
  tonWalletVersion,
  createCoin,
  deleteCoin,
}: MoveTonCoinsToWalletVersionInput) => {
  for (const vault of vaults) {
    if (isKeyImportVault(vault) && !vault.chainPublicKeys?.[Chain.Ton]) {
      continue
    }

    const tonCoins = vault.coins.filter(coin => coin.chain === Chain.Ton)
    if (tonCoins.length === 0) {
      continue
    }

    const address = getChainAddress({
      chain: Chain.Ton,
      walletCore,
      hexChainCode: vault.hexChainCode,
      publicKeys: vault.publicKeys,
      publicKeyMldsa: vault.publicKeyMldsa,
      chainPublicKeys: vault.chainPublicKeys,
      tonWalletVersion,
    })

    const vaultId = getVaultId(vault)
    for (const coin of tonCoins) {
      await deleteCoin({ vaultId, coinKey: coin })
      await createCoin({ vaultId, coin: { ...coin, address } })
    }
  }
}

/**
 * Moves every vault's TON coins onto the matching account, then persists the
 * flag. The move goes first so a failure leaves storage exactly as it was, and
 * so a flag that somehow got ahead of the coins heals on the next flip: the
 * move is idempotent, it rewrites every TON coin to the chosen contract's
 * address whatever it held before.
 */
export const useSetIsTonW5EnabledMutation = () => {
  const { setIsTonW5Enabled, createCoin, deleteCoin } = useCore()
  const vaults = useVaults()
  const walletCore = useAssertWalletCore()
  const refetchQueries = useRefetchQueries()

  const mutationFn: SetIsTonW5EnabledFunction = async isTonW5Enabled => {
    await moveTonCoinsToWalletVersion({
      vaults,
      walletCore,
      tonWalletVersion: getTonWalletVersion(isTonW5Enabled),
      createCoin,
      deleteCoin,
    })

    await setIsTonW5Enabled(isTonW5Enabled)

    await refetchQueries([StorageKey.isTonW5Enabled], [StorageKey.vaultsCoins])
  }

  return useMutation({
    mutationFn,
  })
}
