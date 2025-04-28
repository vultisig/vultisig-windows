import { usePersistentStateQuery } from '@clients/extension/src/state/persistent/usePersistentStateQuery'
import { Chain } from '@core/chain/Chain'
import { defaultChains } from '@core/ui/chain/state/defaultChains'
import { defaultChainsQueryKey } from '@core/ui/query/keys'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

const [key] = defaultChainsQueryKey

export const { provider: DefaultChainsProvider, useValue: useDefaultChains } =
  getValueProviderSetup<Chain[]>('defaultChains')

export const useDefaultChainsQuery = () =>
  usePersistentStateQuery<Chain[]>(key, defaultChains)
