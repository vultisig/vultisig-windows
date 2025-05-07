import { Chain } from '@core/chain/Chain'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { fixedDataQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useMutation, useQuery } from '@tanstack/react-query'

import { defaultChainsQueryKey } from '../query/keys'
import { useCore } from '../state/core'
import { SetDefaultChainsFunction } from './CoreStorage'

export const initialDefaultChains = [
  Chain.Bitcoin,
  Chain.Ethereum,
  Chain.THORChain,
  Chain.Solana,
  Chain.BSC,
]

export const useDefaultChainsQuery = () => {
  const { getDefaultChains } = useCore()

  return useQuery({
    queryKey: defaultChainsQueryKey,
    queryFn: getDefaultChains,
    ...fixedDataQueryOptions,
  })
}

export const useDefaultChains = () => {
  const { data } = useDefaultChainsQuery()

  return shouldBeDefined(data)
}

export const useSetDefaultChainsMutation = () => {
  const { setDefaultChains } = useCore()
  const invalidateQueries = useInvalidateQueries()

  const mutationFn: SetDefaultChainsFunction = async input => {
    await setDefaultChains(input)
    await invalidateQueries(defaultChainsQueryKey)
  }

  return useMutation({
    mutationFn,
  })
}
