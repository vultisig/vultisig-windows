import { useEffect, useMemo } from 'react'

import { storage } from '../../../../../wailsjs/go/models'
import { Query } from '../../../../lib/ui/query/Query'
import { useKeygenMutation } from '../../../keygen/shared/mutations/useKeygenMutation'
import { useSaveVaultMutation } from '../../../mutations/useSaveVaultMutation'

export const useCreateVaultSetup = (): Query<storage.Vault> => {
  const { mutate: saveVault, ...saveVaultState } = useSaveVaultMutation()
  const { mutate: performKeygen, ...keygenState } = useKeygenMutation({
    onSuccess: saveVault,
  })

  useEffect(performKeygen, [performKeygen])

  return useMemo(() => {
    if (saveVaultState.data) {
      return {
        data: saveVaultState.data,
        isPending: false,
        error: null,
      }
    }

    const error = keygenState.error || saveVaultState.error
    if (error) {
      return {
        data: undefined,
        isPending: false,
        error,
      }
    }

    return {
      data: undefined,
      isPending: true,
      error: null,
    }
  }, [keygenState.error, saveVaultState.data, saveVaultState.error])
}
