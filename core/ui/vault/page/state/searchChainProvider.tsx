import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const { provider: SearchChainProvider, useState: useSearchChain } =
  getStateProviderSetup<string>('SearchChainProvider')
