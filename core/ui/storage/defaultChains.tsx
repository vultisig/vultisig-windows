import { Chain } from '@core/chain/Chain'
import { useCoreStorage } from '@core/ui/state/storage'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useMutation, useQuery } from '@tanstack/react-query'

import { defaultChainsQueryKey } from '../query/keys'

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

export const useSetDefaultChainsMutation = () => {
  const { setDefaultChains } = useCoreStorage()
  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: async (chains: Chain[]) => {
      await setDefaultChains(chains)
    },
    onSuccess: () => {
      invalidateQueries(defaultChainsQueryKey)
    },
  })
}
