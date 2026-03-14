import { Chain, defaultChains } from '@core/chain/Chain'
import { getDefaultVisibleChains } from '@core/chain/chainGroups'
import { getMoneroAddress } from '@core/chain/chains/monero/getMoneroAddress'
import { ensureZcashSaplingScanState } from '@core/chain/chains/zcash/vaultSetup'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getVaultId, isKeyImportVault, Vault } from '@core/mpc/vault/Vault'
import { useCore } from '@core/ui/state/core'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
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

      await refetchQueries([StorageKey.vaults])

      await setCurrentVaultId(getVaultId(vault))

      const chainsToCreate = isKeyImportVault(vault)
        ? getDefaultVisibleChains(
            getRecordKeys(shouldBePresent(vault.chainPublicKeys))
          )
        : [...defaultChains]

      const coins = await Promise.all(
        chainsToCreate
          .filter(
            chain => chain !== Chain.ZcashSapling && chain !== Chain.Monero
          )
          .map(async chain => {
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

      if (chainsToCreate.includes(Chain.ZcashSapling)) {
        const { address } = await ensureZcashSaplingScanState(vault)
        coins.push({
          ...chainFeeCoin[Chain.ZcashSapling],
          address,
        })
      }

      if (chainsToCreate.includes(Chain.Monero)) {
        const keyShare = shouldBePresent(
          vault.chainKeyShares?.[Chain.Monero],
          'Fromt key share'
        )
        const address = await getMoneroAddress(keyShare)
        coins.push({
          ...chainFeeCoin[Chain.Monero],
          address,
        })
      }

      await createCoins({
        vaultId: getVaultId(vault),
        coins,
      })

      return vault
    },
    ...options,
  })
}
