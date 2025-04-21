import { useLocation } from 'react-router-dom'

import { CorePathState, CorePathsWithState } from '..'

export function useCorePathState<P extends CorePathsWithState>() {
  const { state } = useLocation()

  return state as CorePathState[P]
}
