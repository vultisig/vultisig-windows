import { AccountCoin, AccountCoinKey } from '@core/chain/coin/AccountCoin'
import { Coin } from '@core/chain/coin/Coin'
import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
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

  const invalidate = useInvalidateQueries()

  const { createCoin } = useCore()

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

    await createCoin({ vaultId, coin: { ...coin, address } })

    await invalidate([StorageKey.vaultsCoins])
  }

  return useMutation({
    mutationFn,
  })
}

export const useCreateCoinsMutation = () => {
  const invalidate = useInvalidateQueries()

  const { createCoins } = useCore()

  const mutationFn: CreateCoinsFunction = async input => {
    await createCoins(input)
    await invalidate([StorageKey.vaultsCoins])
  }

  return useMutation({
    mutationFn,
  })
}

export const useDeleteCoinMutation = () => {
  const invalidate = useInvalidateQueries()

  const { deleteCoin } = useCore()

  const vaultId = useAssertCurrentVaultId()

  const mutationFn = async (coinKey: AccountCoinKey) => {
    await deleteCoin({ vaultId, coinKey })
    await invalidate([StorageKey.vaultsCoins])
  }

  return useMutation({
    mutationFn,
  })
}
