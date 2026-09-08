import { useCore } from '@core/ui/state/core'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'

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
  >,
  recoveryVault?: Vault
) => {
  const { setFriendReferral } = useCore()
  const { mutateAsync: createVault } = useCreateVaultMutation(
    undefined,
    recoveryVault
  )

  return useMutation({
    mutationFn: async ({
      vault,
      pendingReferral,
    }: CreateVaultWithReferralInput) => {
      const createdVault = await createVault(vault)

      if (pendingReferral.trim()) {
        const saveReferral = setFriendReferral(
          getVaultId(createdVault),
          pendingReferral.trim().toUpperCase()
        )
        if (recoveryVault) {
          const [saveReferralResult] = await Promise.allSettled([saveReferral])
          if (saveReferralResult.status === 'rejected') {
            console.error(
              'Failed to persist referral during vault recovery',
              saveReferralResult.reason
            )
          }
        } else {
          await saveReferral
        }
      }

      return createdVault
    },
    ...options,
  })
}
