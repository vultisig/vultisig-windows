import { useNavigate } from '@lib/ui/navigation/state'
import { useCallback } from 'react'

import { AppPath } from '..'

type NoStateOptions = {
  replace?: boolean
}

export function useAppNavigate() {
  const navigate = useNavigate()

  type AppNavigate = {
    (id: AppPath, options?: NoStateOptions): void
  }

  const appNavigate = useCallback(
    (id: AppPath, options: NoStateOptions = {}) => {
      navigate({ id, ...options })
    },
    [navigate]
  ) as AppNavigate

  return appNavigate
}
