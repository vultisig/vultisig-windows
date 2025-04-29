import { Chain } from '@core/chain/Chain'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation } from '@tanstack/react-query'

import { defaultChainsQueryKey } from '../../query/keys'
import { useCoreStorage } from '../../state/storage'

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
