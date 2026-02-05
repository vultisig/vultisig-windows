import { getVaultId, Vault } from '@core/mpc/vault/Vault'
import { useCore } from '@core/ui/state/core'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { useCreateVaultMutation } from './useCreateVaultMutation'

type CreateVaultWithReferralInput = {
  vault: Vault
  pendingReferral: string
}

export const useCreateVaultWithReferralMutation = (
  options?: UseMutationOptions<
    Vault,
    Error,
    CreateVaultWithReferralInput,
    unknown
  >
) => {
  const { setFriendReferral } = useCore()
  const { mutateAsync: createVault } = useCreateVaultMutation()

  return useMutation({
    mutationFn: async ({
      vault,
      pendingReferral,
    }: CreateVaultWithReferralInput) => {
      const createdVault = await createVault(vault)

      if (pendingReferral.trim()) {
        await setFriendReferral(
          getVaultId(createdVault),
          pendingReferral.trim().toUpperCase()
        )
      }

      return createdVault
    },
    ...options,
  })
}
