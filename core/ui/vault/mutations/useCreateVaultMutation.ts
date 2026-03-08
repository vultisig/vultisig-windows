import { Chain, defaultChains } from '@core/chain/Chain'
import { getMoneroAddress } from '@core/chain/chains/monero/getMoneroAddress'
import { getZcashZAddress } from '@core/chain/chains/zcash/getZcashZAddress'
import { saveScannerKeys } from '@core/chain/chains/zcash/scannerKeys'
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

      const froztChains = vault.chainPublicKeys
        ? getRecordKeys(vault.chainPublicKeys)
        : []
      const chainsToCreate = isKeyImportVault(vault)
        ? getRecordKeys(shouldBePresent(vault.chainPublicKeys))
        : [
            ...defaultChains,
            ...froztChains.filter(c => !(defaultChains as Chain[]).includes(c)),
          ]

      const coins = await Promise.all(
        chainsToCreate
          .filter(
            chain => chain !== Chain.ZcashShielded && chain !== Chain.Monero
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

      if (chainsToCreate.includes(Chain.ZcashShielded)) {
        const pubKeyPackage = shouldBePresent(
          vault.chainPublicKeys?.[Chain.ZcashShielded],
          'Frozt public key package'
        )
        const address = await getZcashZAddress(
          pubKeyPackage,
          vault.saplingExtras ?? ''
        )
        saveScannerKeys(address, pubKeyPackage, vault.saplingExtras ?? '')
        coins.push({
          ...chainFeeCoin[Chain.ZcashShielded],
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
