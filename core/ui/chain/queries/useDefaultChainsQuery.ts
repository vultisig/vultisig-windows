import { useCoreStorage } from '@core/ui/state/storage'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useQuery } from '@tanstack/react-query'

import { defaultChainsQueryKey } from '../../query/keys'

export const useDefaultChainsQuery = () => {
  const { getDefaultChains } = useCoreStorage()

  return useQuery({
    queryKey: defaultChainsQueryKey,
    queryFn: getDefaultChains,
  })
}

export const useDefaultChains = () => {
  const { data } = useDefaultChainsQuery()

  return shouldBeDefined(data)
}
