import { useRouteState } from '@lib/ui/navigation/state'

import { CorePathState, CorePathsWithState } from '..'

export function useCorePathState<P extends CorePathsWithState>() {
  const state = useRouteState()

  return state as CorePathState[P]
}
