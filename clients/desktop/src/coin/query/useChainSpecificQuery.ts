import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/ChainSpecificResolver'
import { withoutUndefined } from '@lib/utils/array/withoutUndefined'
import { useQuery } from '@tanstack/react-query'

export const chainSpecificQueryKeyPrefix = 'chainSpecific'

export const getChainSpecificQueryKey = (input: ChainSpecificResolverInput) =>
  withoutUndefined([chainSpecificQueryKeyPrefix, ...Object.values(input)])

export const useChainSpecificQuery = (input: ChainSpecificResolverInput) => {
  return useQuery({
    queryKey: getChainSpecificQueryKey(input),
    queryFn: () => getChainSpecific(input),
  })
}
