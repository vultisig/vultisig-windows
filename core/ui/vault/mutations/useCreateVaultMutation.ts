import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { deriveAddress } from '@core/chain/utils/deriveAddress'
import { useCore } from '@core/ui/state/core'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { useAssertWalletCore } from '../../chain/providers/WalletCoreProvider'
import { useCreateCoinsMutation } from '../../storage/coins'
import { useSetCurrentVaultIdMutation } from '../../storage/currentVaultId'
import { StorageKey } from '../../storage/StorageKey'
import { useVaults } from '../../storage/vaults'

export const useCreateVaultMutation = (
  options?: UseMutationOptions<any, any, Vault, unknown>
) => {
  const invalidateQueries = useInvalidateQueries()
  const vaults = useVaults()

  const { createVault, getDefaultChains } = useCore()

  const { mutateAsync: setCurrentVaultId } = useSetCurrentVaultIdMutation()
  const { mutateAsync: createCoins } = useCreateCoinsMutation()

  const walletCore = useAssertWalletCore()

  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (input: Vault) => {
      if (vaults.find(v => getVaultId(v) === getVaultId(input))) {
        throw new Error(t('vault_already_exists'))
      }

      const vault = await createVault(input)

      await invalidateQueries([StorageKey.vaults])

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

      await createCoins({
        vaultId: getVaultId(vault),
        coins,
      })

      return vault
    },
    ...options,
  })
}
