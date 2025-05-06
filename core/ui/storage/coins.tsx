import { AccountCoin, AccountCoinKey } from '@core/chain/coin/AccountCoin'
import { Coin } from '@core/chain/coin/Coin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { deriveAddress } from '@core/chain/utils/deriveAddress'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { vaultsCoinsQueryKey } from '@core/ui/query/keys'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { useAssertCurrentVaultId } from './currentVaultId'

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
  }

  return useMutation({
    mutationFn,
    onSuccess: () => invalidate(vaultsCoinsQueryKey),
  })
}

export const useCreateCoinsMutation = () => {
  const invalidate = useInvalidateQueries()

  const { createVaultCoins } = useCore()

  const vaultId = useAssertCurrentVaultId()

  return useMutation({
    mutationFn: (coins: AccountCoin[]) => createVaultCoins({ vaultId, coins }),
    onSuccess: () => invalidate(vaultsCoinsQueryKey),
  })
}

export const useDeleteCoinMutation = () => {
  const invalidate = useInvalidateQueries()

  const { deleteVaultCoin } = useCore()

  const vaultId = useAssertCurrentVaultId()

  return useMutation({
    mutationFn: async (coinKey: AccountCoinKey) =>
      deleteVaultCoin({ vaultId, coinKey }),
    onSuccess: () => invalidate(vaultsCoinsQueryKey),
  })
}
