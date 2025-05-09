import { useRouteState } from '@lib/ui/navigation/state'
import { Dispatch, SetStateAction } from 'react'

import { AppPathState, AppPathsWithState } from '..'

export function useAppPathState<P extends AppPathsWithState>(): [
  AppPathState[P],
  Dispatch<SetStateAction<AppPathState[P]>>,
] {
  const [state, setState] = useRouteState()

  return [
    state as AppPathState[P],
    setState as Dispatch<SetStateAction<AppPathState[P]>>,
  ]
}
