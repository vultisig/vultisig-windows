import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export type CircleViewState = 'home' | 'withdraw'

export const [CircleViewStateProvider, useCircleViewState] =
  setupStateProvider<CircleViewState>('CircleViewState')
