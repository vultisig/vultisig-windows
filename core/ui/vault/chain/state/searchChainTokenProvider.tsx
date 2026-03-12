import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export const [SearchChainTokenProvider, useSearchChainToken] =
  setupStateProvider<string>('SearchChainTokenProvider')
