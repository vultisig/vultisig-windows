import {
  ErrorBoundary,
  ErrorBoundaryProcessError,
} from '@lib/ui/errors/ErrorBoundary'
import { ChildrenProp } from '@lib/ui/props'
import { NoContextError } from '@lib/ui/state/NoContextError'
import { useCallback } from 'react'

import { useCoreNavigate } from '../navigation/hooks/useCoreNavigate'
import { currentVaultContextId } from '../vault/state/currentVault'
import { RootErrorFallback } from './RootErrorFallback'

export const RootErrorBoundary = ({ children }: ChildrenProp) => {
  const navigate = useCoreNavigate()

  const processRootError: ErrorBoundaryProcessError = useCallback(
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

  return (
    <ErrorBoundary fallback={RootErrorFallback} processError={processRootError}>
      {children}
    </ErrorBoundary>
  )
}
