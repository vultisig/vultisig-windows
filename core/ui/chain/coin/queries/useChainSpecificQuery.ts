import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/resolver'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { without } from '@lib/utils/array/without'
import { useQuery } from '@tanstack/react-query'

export const chainSpecificQueryKeyPrefix = 'chainSpecific'

export const getChainSpecificQueryKey = (input: ChainSpecificResolverInput) =>
  without([chainSpecificQueryKeyPrefix, ...Object.values(input)], undefined)

export const useChainSpecificQuery = (input: ChainSpecificResolverInput) => {
  return useQuery({
    queryKey: getChainSpecificQueryKey(input),
    queryFn: () => getChainSpecific(input),
    ...noRefetchQueryOptions,
  })
}
