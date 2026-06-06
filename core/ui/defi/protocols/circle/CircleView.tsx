import { VStack } from '@lib/ui/layout/Stack'
import { ComponentType } from 'react'

import { CircleHomeView } from './home/CircleHomeView'
import {
  CircleViewState,
  CircleViewStateProvider,
  useCircleViewState,
} from './state/circleViewState'
import { CircleWithdrawView } from './withdraw/CircleWithdrawView'

const views: Record<CircleViewState, ComponentType> = {
  home: CircleHomeView,
  withdraw: CircleWithdrawView,
}

const CircleViewContent = () => {
  const [viewState] = useCircleViewState()
  const ViewComponent = views[viewState]

  return (
    <VStack flexGrow>
      <ViewComponent />
    </VStack>
  )
}

export const CircleView = () => {
  return (
    <CircleViewStateProvider initialValue="home">
      <CircleViewContent />
    </CircleViewStateProvider>
  )
}
