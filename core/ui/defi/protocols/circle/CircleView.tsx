import { VStack } from '@lib/ui/layout/Stack'
import { ComponentType } from 'react'

import { CircleDepositView } from './deposit/CircleDepositView'
import { CircleHomeView } from './home/CircleHomeView'
import {
  CircleViewState,
  CircleViewStateProvider,
  useCircleViewState,
} from './state/circleViewState'
import { CircleWithdrawView } from './withdraw/CircleWithdrawView'

const views: Record<CircleViewState, ComponentType> = {
  home: CircleHomeView,
  deposit: CircleDepositView,
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
