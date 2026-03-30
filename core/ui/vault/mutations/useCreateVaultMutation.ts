import { useCore } from '@core/ui/state/core'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { defaultChains } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import {
  getVaultId,
  isKeyImportVault,
  Vault,
} from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { pipe } from '@vultisig/lib-utils/pipe'
import { getRecordKeys } from '@vultisig/lib-utils/record/getRecordKeys'

import { useAssertWalletCore } from '../../chain/providers/WalletCoreProvider'
import { encryptVaultAllKeyShares } from '../../passcodeEncryption/core/vaultKeyShares'
import { usePasscode } from '../../passcodeEncryption/state/passcode'
import { useCreateCoinsMutation } from '../../storage/coins'
import { useSetCurrentVaultIdMutation } from '../../storage/currentVaultId'
import { useHasPasscodeEncryption } from '../../storage/passcodeEncryption'
import { StorageKey } from '../../storage/StorageKey'
import { getChainAddress } from '../../utils/getChainAddress'

export const useCreateVaultMutation = (
  options?: UseMutationOptions<any, any, Vault, unknown>
) => {
  const refetchQueries = useRefetchQueries()
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
              keyShareMldsa: vault.keyShareMldsa,
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

      const chainsToCreate = isKeyImportVault(vault)
        ? getRecordKeys(shouldBePresent(vault.chainPublicKeys))
        : defaultChains

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

      const vaultId = getVaultId(vault)

      await createCoins({ vaultId, coins })

      await refetchQueries([StorageKey.vaults])

      await setCurrentVaultId(vaultId)

      return vault
    },
    ...options,
  })
}
