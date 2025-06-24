import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { useCore } from '@core/ui/state/core'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { pipe } from '@lib/utils/pipe'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { useAssertWalletCore } from '../../chain/providers/WalletCoreProvider'
import { encryptVaultKeyShares } from '../../passcodeEncryption/core/vaultKeyShares'
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

  const { createVault, getDefaultChains } = useCore()

  const { mutateAsync: setCurrentVaultId } = useSetCurrentVaultIdMutation()
  const { mutateAsync: createCoins } = useCreateCoinsMutation()

  const walletCore = useAssertWalletCore()

  return useMutation({
    mutationFn: async (input: Vault) => {
      const vault = await createVault(
        pipe(input, ({ keyShares }) => {
          if (hasPasscodeEncryption) {
            return {
              ...input,
              keyShares: encryptVaultKeyShares({
                keyShares,
                key: shouldBePresent(passcode),
              }),
            }
          }

          return input
        })
      )

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
