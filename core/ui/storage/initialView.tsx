import { fixedDataQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'

import { initialViewQueryKey } from '../query/keys'
import { useCore } from '../state/core'

export const useInitialViewQuery = () => {
  const { getInitialView } = useCore()

  return useQuery({
    queryKey: initialViewQueryKey,
    queryFn: getInitialView,
    ...fixedDataQueryOptions,
  })
}
