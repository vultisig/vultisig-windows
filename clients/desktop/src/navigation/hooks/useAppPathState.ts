import { useRouteState } from '@lib/ui/navigation/state'

import { AppPathState, AppPathsWithState } from '..'

export function useAppPathState<P extends AppPathsWithState>() {
  const state = useRouteState()

  return state as AppPathState[P]
}
