import { fixedDataQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'

import { initialRouteQueryKey } from '../query/keys'
import { useCore } from '../state/core'

export const useInitialRouteQuery = () => {
  const { getInitialRoute } = useCore()

  return useQuery({
    queryKey: initialRouteQueryKey,
    queryFn: getInitialRoute,
    ...fixedDataQueryOptions,
  })
}
