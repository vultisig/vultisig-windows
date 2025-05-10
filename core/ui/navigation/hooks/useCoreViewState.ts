import { useViewState } from '@lib/ui/navigation/hooks/useViewState'

import { CoreView } from '../CoreView'

type CoreViewWithState = Extract<CoreView, { state: any }>
export type CoreViewWithStateId = CoreViewWithState['id']
export type CoreViewStateMap = {
  [K in CoreViewWithStateId]: Extract<CoreView, { id: K }>['state']
}

export function useCoreViewState<P extends CoreViewWithStateId>() {
  return useViewState<CoreViewStateMap[P]>()
}
