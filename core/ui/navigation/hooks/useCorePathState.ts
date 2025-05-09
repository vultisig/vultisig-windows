import { useRouteState } from '@lib/ui/navigation/state'
import { Dispatch, SetStateAction } from 'react'

import { CorePathState, CorePathsWithState } from '..'

export function useCorePathState<P extends CorePathsWithState>(): [
  CorePathState[P],
  Dispatch<SetStateAction<CorePathState[P]>>,
] {
  const [state, setState] = useRouteState()

  return [
    state as CorePathState[P],
    setState as Dispatch<SetStateAction<CorePathState[P]>>,
  ]
}
