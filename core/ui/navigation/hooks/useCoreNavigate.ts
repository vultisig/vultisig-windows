import { useNavigate } from '@lib/ui/navigation/state'
import { useCallback } from 'react'

import {
  CorePath,
  CorePathState,
  CorePathsWithoutState,
  CorePathsWithState,
} from '..'

type StateOptions<P extends CorePathsWithState> = {
  state: CorePathState[P]
  replace?: boolean
}

type NoStateOptions = {
  replace?: boolean
}

export function useCoreNavigate() {
  const navigate = useNavigate()

  type CoreNavigate = {
    <P extends CorePathsWithState>(id: P, options: StateOptions<P>): void
    (id: CorePathsWithoutState, options?: NoStateOptions): void
  }

  const coreNavigate = useCallback(
    (id: CorePath, options: any = {}) => {
      navigate({ id, ...options })
    },
    [navigate]
  ) as CoreNavigate

  return coreNavigate
}
