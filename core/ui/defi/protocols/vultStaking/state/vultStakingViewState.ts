import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

import { PendingUnstake } from '../core/getPendingUnstakes'

export type VultStakingViewState =
  | { type: 'home' }
  | { type: 'stake' }
  | { type: 'unstake' }
  | { type: 'claim'; request: PendingUnstake }
  | { type: 'cancel'; request: PendingUnstake }

export const [VultStakingViewStateProvider, useVultStakingViewState] =
  setupStateProvider<VultStakingViewState>('VultStakingViewState')
