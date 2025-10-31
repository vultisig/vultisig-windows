import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const {
  provider: SearchChainTokenProvider,
  useState: useSearchChainToken,
} = getStateProviderSetup<string>('SearchChainTokenProvider')
