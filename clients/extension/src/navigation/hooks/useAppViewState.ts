import { useViewState } from '@lib/ui/navigation/hooks/useViewState'

import { AppView } from '../AppView'

type AppViewWithState = Extract<AppView, { state: any }>
type AppViewWithStateId = AppViewWithState['id']
type CoreViewStateMap = {
  [K in AppViewWithStateId]: Extract<AppView, { id: K }>['state']
}

export function useAppViewState<P extends AppViewWithStateId>() {
  return useViewState<CoreViewStateMap[P]>()
}
