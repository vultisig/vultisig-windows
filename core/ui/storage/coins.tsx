import { loadWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useMutation } from '@tanstack/react-query'
import {
  AccountCoin,
  AccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { getChainAddress } from '@vultisig/core-chain/publicKey/address/getChainAddress'
import { isKeyImportVault } from '@vultisig/core-mpc/vault/Vault'
import { assertField } from '@vultisig/lib-utils/record/assertField'

import { useAssertCurrentVaultId } from './currentVaultId'
import { StorageKey } from './StorageKey'

type CreateCoinsInput = {
  vaultId: string
  coins: AccountCoin[]
}

export type CreateCoinsFunction = (input: CreateCoinsInput) => Promise<void>

export type CoinsRecord = Record<string, AccountCoin[]>

export const initialCoinsRecord: CoinsRecord = {}

type GetCoinsFunction = () => Promise<CoinsRecord>

type CreateCoinInput = {
  vaultId: string
  coin: AccountCoin
}

type CreateCoinFunction = (input: CreateCoinInput) => Promise<void>

type DeleteCoinInput = {
  vaultId: string
  coinKey: AccountCoinKey
}

type DeleteCoinFunction = (input: DeleteCoinInput) => Promise<void>

export type CoinsStorage = {
  createCoins: CreateCoinsFunction
  getCoins: GetCoinsFunction
  createCoin: CreateCoinFunction
  deleteCoin: DeleteCoinFunction
}

/** Adds a coin to the current vault, deriving its address with WalletCore once the WASM has loaded. */
export const useCreateCoinMutation = () => {
  const vault = useCurrentVault()

  const refetch = useRefetchQueries()

  const { createCoin } = useCore()

  const vaultId = useAssertCurrentVaultId()

  const mutationFn = async (coin: Coin) => {
    if (isKeyImportVault(vault)) {
      const chainPublicKeys = assertField(vault, 'chainPublicKeys')
      if (!chainPublicKeys[coin.chain]) {
        throw new Error(
          `Cannot add coin: chain ${coin.chain} is not enabled for this vault`
        )
      }
    }

    // Awaited here rather than asserted at render so the home screen, which
    // mounts this mutation for its promo banners, does not wait on the WASM.
    const walletCore = await loadWalletCore()

    const address = getChainAddress({
      chain: coin.chain,
      walletCore,
      hexChainCode: vault.hexChainCode,
      publicKeys: vault.publicKeys,
      publicKeyMldsa: vault.publicKeyMldsa,
      chainPublicKeys: vault.chainPublicKeys,
    })

    const accountCoin = { ...coin, address }

    await createCoin({ vaultId, coin: accountCoin })

    await refetch([StorageKey.vaultsCoins])

    return accountCoin
  }

  return useMutation({
    mutationFn,
  })
}

export const useCreateCoinsMutation = () => {
  const refetch = useRefetchQueries()

  const { createCoins } = useCore()

  const mutationFn: CreateCoinsFunction = async input => {
    await createCoins(input)
    await refetch([StorageKey.vaultsCoins])
  }

  return useMutation({
    mutationFn,
  })
}

export const useDeleteCoinMutation = () => {
  const refetch = useRefetchQueries()

  const { deleteCoin } = useCore()

  const vaultId = useAssertCurrentVaultId()

  const mutationFn = async (coinKey: AccountCoinKey) => {
    await deleteCoin({ vaultId, coinKey })
    await refetch([StorageKey.vaultsCoins])
  }

  return useMutation({
    mutationFn,
  })
}
