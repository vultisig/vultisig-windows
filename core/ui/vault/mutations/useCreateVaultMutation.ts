import { useCore } from '@core/ui/state/core'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { getChainAddress } from '@vultisig/core-chain/publicKey/address/getChainAddress'
import {
  getVaultId,
  isKeyImportVault,
  Vault,
} from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { getRecordKeys } from '@vultisig/lib-utils/record/getRecordKeys'

import { useAssertWalletCore } from '../../chain/providers/WalletCoreProvider'
import {
  assertVaultKeySharesReadable,
  encryptVaultAllKeyShares,
} from '../../passcodeEncryption/core/vaultKeyShares'
import { usePasscode } from '../../passcodeEncryption/state/passcode'
import { useIsPasscodeRequired } from '../../passcodeEncryption/state/useIsPasscodeRequired'
import { currentProductBrand } from '../../product/brand'
import { useCreateCoinsMutation } from '../../storage/coins'
import { useSetCurrentVaultIdMutation } from '../../storage/currentVaultId'
import { StorageKey } from '../../storage/StorageKey'
import { getDefaultVaultChains } from '../chains/defaultVaultChains'

export const useCreateVaultMutation = (
  options?: UseMutationOptions<any, any, Vault, unknown>,
  recoveryVault?: Vault
) => {
  const refetchQueries = useRefetchQueries()
  const queryClient = useQueryClient()
  const hasPasscodeEncryption = useIsPasscodeRequired()
  const [passcode] = usePasscode()

  const { createVault, replaceVault, validateLegacyVaultKeyShares } = useCore()

  const { mutateAsync: setCurrentVaultId } = useSetCurrentVaultIdMutation()
  const { mutateAsync: createCoins } = useCreateCoinsMutation()

  const walletCore = useAssertWalletCore()

  return useMutation({
    mutationFn: async (input: Vault) => {
      await assertVaultKeySharesReadable({
        ...input,
        validateLegacyVaultKeyShares,
      })

      const vaultToCreate = hasPasscodeEncryption
        ? {
            ...input,
            ...(await encryptVaultAllKeyShares({
              keyShares: input.keyShares,
              chainKeyShares: input.chainKeyShares,
              keyShareMldsa: input.keyShareMldsa,
              key: shouldBePresent(passcode),
            })),
          }
        : input

      const vault = recoveryVault
        ? await replaceVault({
            expectedVault: recoveryVault,
            vault: vaultToCreate,
          })
        : await createVault(vaultToCreate)

      const vaultId = getVaultId(vault)
      const createVaultCoins = async () => {
        const chainsToCreate = isKeyImportVault(vault)
          ? getRecordKeys(shouldBePresent(vault.chainPublicKeys))
          : getDefaultVaultChains(currentProductBrand)

        const coins = await Promise.all(
          chainsToCreate.map(async chain => {
            const address = getChainAddress({
              chain,
              walletCore,
              hexChainCode: vault.hexChainCode,
              publicKeys: vault.publicKeys,
              publicKeyMldsa: vault.publicKeyMldsa,
              chainPublicKeys: vault.chainPublicKeys,
            })

            return {
              ...chainFeeCoin[chain],
              address,
            }
          })
        )

        await createCoins({ vaultId, coins })
      }

      if (recoveryVault) {
        // Replacement is already durable. Publish that fact to the active UI
        // before any secondary setup, then make those steps best-effort: an
        // address/coin/refetch failure must not report a false save failure or
        // strand retry behind the exact-snapshot guard.
        queryClient.setQueryData<Vault[]>([StorageKey.vaults], current => {
          if (!current) return [vault]

          let replaced = false
          const next = current.map(candidate => {
            if (getVaultId(candidate) !== vaultId) return candidate
            replaced = true
            return vault
          })

          return replaced ? next : [...next, vault]
        })

        await Promise.allSettled([
          createVaultCoins(),
          refetchQueries([StorageKey.vaults]),
          setCurrentVaultId(vaultId),
        ])
        return vault
      }

      await createVaultCoins()

      await refetchQueries([StorageKey.vaults])

      await setCurrentVaultId(vaultId)

      return vault
    },
    ...options,
  })
}
