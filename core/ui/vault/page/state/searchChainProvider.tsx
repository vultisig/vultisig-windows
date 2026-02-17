import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export const [SearchChainProvider, useSearchChain] = setupStateProvider<string>(
  'SearchChainProvider'
)
