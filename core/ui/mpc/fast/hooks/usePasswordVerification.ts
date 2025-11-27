import { getVaultFromServer } from '@core/mpc/fast/api/getVaultFromServer'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useMutation } from '@tanstack/react-query'

type UsePasswordVerificationInput = {
  onSuccess?: () => void
}

export const usePasswordVerification = ({
  onSuccess,
}: UsePasswordVerificationInput = {}) => {
  const vault = useCurrentVault()
  const vaultId = getVaultId(vault)
  const { mutateAsync: updateVault } = useUpdateVaultMutation()

  const { mutate, error, isPending } = useMutation({
    mutationFn: async (password?: string) => {
      if (password) {
        await getVaultFromServer({
          vaultId: vaultId,
          password,
        })
      }
      await updateVault({
        vaultId,
        fields: {
          lastPasswordVerificationTime: Date.now(),
        },
      })
      onSuccess?.()
    },
  })

  return {
    verifyPassword: mutate,
    error,
    isPending,
  }
}
