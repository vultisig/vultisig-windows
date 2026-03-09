import { Chain } from '@core/chain/Chain'
import { getMoneroAddress } from '@core/chain/chains/monero/getMoneroAddress'
import { getZcashZAddress } from '@core/chain/chains/zcash/getZcashZAddress'
import { getZcashScanStorage } from '@core/chain/chains/zcash/zcashScanStorage'
import { AccountCoin, AccountCoinKey } from '@core/chain/coin/AccountCoin'
import { Coin } from '@core/chain/coin/Coin'
import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { isKeyImportVault } from '@core/mpc/vault/Vault'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { assertField } from '@lib/utils/record/assertField'
import { useMutation } from '@tanstack/react-query'

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

export const useCreateCoinMutation = () => {
  const vault = useCurrentVault()

  const walletCore = useAssertWalletCore()

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

    let address: string

    if (coin.chain === Chain.ZcashShielded) {
      const pubKeyPackage = shouldBePresent(
        vault.chainPublicKeys?.[Chain.ZcashShielded],
        'Frozt public key package'
      )
      address = await getZcashZAddress(pubKeyPackage, vault.saplingExtras ?? '')
      await getZcashScanStorage().save({
        zAddress: address,
        publicKeyEcdsa: vault.publicKeys.ecdsa,
        scanHeight: null,
        scanTarget: null,
        birthHeight: null,
        birthdayScanDone: false,
        pubKeyPackage,
        saplingExtras: vault.saplingExtras ?? '',
        notes: [],
      })
    } else if (coin.chain === Chain.Monero) {
      const keyShare = shouldBePresent(
        vault.chainKeyShares?.[Chain.Monero],
        'Fromt key share'
      )
      address = await getMoneroAddress(keyShare)
    } else {
      const publicKey = getPublicKey({
        chain: coin.chain,
        walletCore,
        hexChainCode: vault.hexChainCode,
        publicKeys: vault.publicKeys,
        chainPublicKeys: vault.chainPublicKeys,
      })

      address = deriveAddress({
        chain: coin.chain,
        publicKey,
        walletCore,
      })
    }

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
