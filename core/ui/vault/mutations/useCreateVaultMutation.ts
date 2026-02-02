import { defaultChains } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getVaultId, isKeyImportVault, Vault } from '@core/mpc/vault/Vault'
import { useCore } from '@core/ui/state/core'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { pipe } from '@lib/utils/pipe'
import { getRecordKeys } from '@lib/utils/record/getRecordKeys'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { useAssertWalletCore } from '../../chain/providers/WalletCoreProvider'
import { encryptVaultAllKeyShares } from '../../passcodeEncryption/core/vaultKeyShares'
import { usePasscode } from '../../passcodeEncryption/state/passcode'
import { useCreateCoinsMutation } from '../../storage/coins'
import { useSetCurrentVaultIdMutation } from '../../storage/currentVaultId'
import { useHasPasscodeEncryption } from '../../storage/passcodeEncryption'
import { StorageKey } from '../../storage/StorageKey'

export const useCreateVaultMutation = (
  options?: UseMutationOptions<any, any, Vault, unknown>
) => {
  const invalidateQueries = useInvalidateQueries()
  const hasPasscodeEncryption = useHasPasscodeEncryption()
  const [passcode] = usePasscode()

  const { createVault } = useCore()

  const { mutateAsync: setCurrentVaultId } = useSetCurrentVaultIdMutation()
  const { mutateAsync: createCoins } = useCreateCoinsMutation()

  const walletCore = useAssertWalletCore()

  return useMutation({
    mutationFn: async (input: Vault) => {
      const vault = await createVault(
        pipe(input, vault => {
          if (hasPasscodeEncryption) {
            const key = shouldBePresent(passcode)
            const encrypted = encryptVaultAllKeyShares({
              keyShares: vault.keyShares,
              chainKeyShares: vault.chainKeyShares,
              key,
            })
            return {
              ...vault,
              ...encrypted,
            }
          }

          return vault
        })
      )

      await invalidateQueries([StorageKey.vaults])

      await setCurrentVaultId(getVaultId(vault))

      const chainsToCreate = isKeyImportVault(vault)
        ? getRecordKeys(shouldBePresent(vault.chainPublicKeys))
        : defaultChains

      const coins = await Promise.all(
        chainsToCreate.map(async chain => {
          const publicKey = getPublicKey({
            chain,
            walletCore,
            hexChainCode: vault.hexChainCode,
            publicKeys: vault.publicKeys,
            chainPublicKeys: vault.chainPublicKeys,
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
