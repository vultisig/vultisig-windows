import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export type CircleViewState = 'home' | 'deposit' | 'withdraw'

export const {
  useState: useCircleViewState,
  provider: CircleViewStateProvider,
} = getStateProviderSetup<CircleViewState>('CircleViewState')
