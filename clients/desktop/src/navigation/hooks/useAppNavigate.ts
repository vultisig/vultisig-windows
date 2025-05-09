import { useNavigate } from '@lib/ui/navigation/state'
import { useCallback } from 'react'

import { AppPathState, AppPathsWithoutState, AppPathsWithState } from '..'

type StateOptions<P extends AppPathsWithState> = {
  state: AppPathState[P]
  replace?: boolean
}

type NoStateOptions = {
  replace?: boolean
}

export function useAppNavigate() {
  const navigate = useNavigate()

  type AppNavigate = {
    <P extends AppPathsWithState>(id: P, options: StateOptions<P>): void
    (id: AppPathsWithoutState, options?: NoStateOptions): void
  }

  const appNavigate = useCallback(
    (id: any, options: any = {}) => {
      const { state, replace } = options

      navigate({
        id,
        state,
        replace,
      })
    },
    [navigate]
  ) as AppNavigate

  return appNavigate
}
