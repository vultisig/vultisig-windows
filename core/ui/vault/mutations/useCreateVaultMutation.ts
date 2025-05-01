import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { deriveAddress } from '@core/chain/utils/deriveAddress'
import { vaultsQueryKey } from '@core/ui/query/keys'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { useAssertWalletCore } from '../../chain/providers/WalletCoreProvider'
import { useCoreStorage } from '../../state/storage'
import { useSetCurrentVaultIdMutation } from '../../storage/currentVaultId'
import { useCreateVaultCoinsMutation } from './useCreateVaultCoinsMutations'

export const useCreateVaultMutation = (
  options?: UseMutationOptions<any, any, Vault, unknown>
) => {
  const invalidateQueries = useInvalidateQueries()

  const { createVault, getDefaultChains } = useCoreStorage()

  const { mutateAsync: setCurrentVaultId } = useSetCurrentVaultIdMutation()
  const { mutateAsync: createVaultCoins } = useCreateVaultCoinsMutation()

  const walletCore = useAssertWalletCore()

  return useMutation({
    mutationFn: async (input: Vault) => {
      const vault = await createVault(input)

      await invalidateQueries(vaultsQueryKey)

      await setCurrentVaultId(getVaultId(vault))

      const defaultChains = await getDefaultChains()
      const coins = await Promise.all(
        defaultChains.map(async chain => {
          const publicKey = getPublicKey({
            chain,
            walletCore,
            hexChainCode: vault.hexChainCode,
            publicKeys: vault.publicKeys,
          })

          const address = deriveAddress({
            chain,
            publicKey,
            walletCore,
          })

          return {
            ...chainFeeCoin[chain],
            address,
          }
        })
      )

      await createVaultCoins({
        vaultId: getVaultId(vault),
        coins,
      })

      return vault
    },
    ...options,
  })
}
