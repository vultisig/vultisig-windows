import { AccountCoinKey } from '@core/chain/coin/AccountCoin'
import { Coin } from '@core/chain/coin/Coin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { deriveAddress } from '@core/chain/utils/deriveAddress'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { CreateVaultCoinsFunction } from './CoreStorage'
import { useAssertCurrentVaultId } from './currentVaultId'
import { StorageKey } from './StorageKey'

export const useCreateCoinMutation = () => {
  const vault = useCurrentVault()

  const walletCore = useAssertWalletCore()

  const invalidate = useInvalidateQueries()

  const { createVaultCoin } = useCore()

  const vaultId = useAssertCurrentVaultId()

  const mutationFn = async (coin: Coin) => {
    const publicKey = getPublicKey({
      chain: coin.chain,
      walletCore,
      hexChainCode: vault.hexChainCode,
      publicKeys: vault.publicKeys,
    })

    const address = deriveAddress({
      chain: coin.chain,
      publicKey,
      walletCore,
    })

    await createVaultCoin({ vaultId, coin: { ...coin, address } })

    await invalidate([StorageKey.vaultsCoins])
  }

  return useMutation({
    mutationFn,
  })
}

export const useCreateCoinsMutation = () => {
  const invalidate = useInvalidateQueries()

  const { createVaultCoins } = useCore()

  const mutationFn: CreateVaultCoinsFunction = async input => {
    await createVaultCoins(input)
    await invalidate([StorageKey.vaultsCoins])
  }

  return useMutation({
    mutationFn,
  })
}

export const useDeleteCoinMutation = () => {
  const invalidate = useInvalidateQueries()

  const { deleteVaultCoin } = useCore()

  const vaultId = useAssertCurrentVaultId()

  const mutationFn = async (coinKey: AccountCoinKey) => {
    await deleteVaultCoin({ vaultId, coinKey })
    await invalidate([StorageKey.vaultsCoins])
  }

  return useMutation({
    mutationFn,
  })
}
