import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export type CircleViewState = 'home' | 'deposit' | 'withdraw'

export const [CircleViewStateProvider, useCircleViewState] =
  setupStateProvider<CircleViewState>('CircleViewState')
