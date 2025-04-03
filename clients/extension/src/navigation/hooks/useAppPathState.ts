import { useLocation } from 'react-router-dom'

import { AppPathState, AppPathsWithState } from '..'

export function useAppPathState<P extends AppPathsWithState>() {
  const { state } = useLocation()

  return state as AppPathState[P]
}
