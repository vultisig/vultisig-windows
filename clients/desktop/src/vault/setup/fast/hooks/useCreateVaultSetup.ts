import { useEffect } from 'react'

import { useKeygenMutation } from '../../../keygen/shared/mutations/useKeygenMutation'
import { useSaveVaultMutation } from '../../../mutations/useSaveVaultMutation'

export const useCreateVaultSetup = () => {
  const { mutate: saveVault, ...saveVaultState } = useSaveVaultMutation()
  const { mutate: performKeygen, ...keygenState } = useKeygenMutation({
    onSuccess: saveVault,
  })

  useEffect(performKeygen, [performKeygen])

  return {
    vault: keygenState.data,
    isPending: keygenState.isPending || saveVaultState.isPending,
    data: keygenState.isSuccess && saveVaultState.isSuccess ? {} : undefined,
    error: keygenState.error || saveVaultState.error,
  }
}
