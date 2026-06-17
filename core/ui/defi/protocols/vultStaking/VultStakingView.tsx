import { VStack } from '@lib/ui/layout/Stack'

import { VultStakingHomeView } from './home/VultStakingHomeView'
import { VultRequestVerify } from './request/VultRequestVerify'
import { VultStakeView } from './stake/VultStakeView'
import {
  useVultStakingViewState,
  VultStakingViewState,
  VultStakingViewStateProvider,
} from './state/vultStakingViewState'
import { VultUnstakeView } from './unstake/VultUnstakeView'

const renderView = (state: VultStakingViewState) => {
  switch (state.type) {
    case 'home':
      return <VultStakingHomeView />
    case 'stake':
      return <VultStakeView />
    case 'unstake':
      return <VultUnstakeView />
    case 'claim':
      return <VultRequestVerify request={state.request} mode="claim" />
    case 'cancel':
      return <VultRequestVerify request={state.request} mode="cancel" />
  }
}

const VultStakingViewContent = () => {
  const [viewState] = useVultStakingViewState()

  return <VStack flexGrow>{renderView(viewState)}</VStack>
}

export const VultStakingView = () => (
  <VultStakingViewStateProvider initialValue={{ type: 'home' }}>
    <VultStakingViewContent />
  </VultStakingViewStateProvider>
)
