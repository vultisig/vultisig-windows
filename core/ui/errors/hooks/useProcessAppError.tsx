import { ErrorBoundaryProcessError } from '@lib/ui/errors/ErrorBoundary'
import { NoContextError } from '@lib/ui/state/NoContextError'
import { useCallback } from 'react'

import { useCoreNavigate } from '../../navigation/hooks/useCoreNavigate'
import { currentVaultContextId } from '../../vault/state/currentVault'

export const useProcessAppError = () => {
  const navigate = useCoreNavigate()

  const process: ErrorBoundaryProcessError = useCallback(
    error => {
      if (
        error instanceof NoContextError &&
        error.contextId === currentVaultContextId
      ) {
        navigate({ id: 'newVault' })
        return null
      }

      return error
    },
    [navigate]
  )

  return process
}
