import { useQuery } from '@tanstack/react-query'

import { fixedDataQueryOptions } from '../../lib/ui/query/utils/options'
import { getSevenZip } from '../getSevenZip'

export const useSevenZipQuery = () => {
  return useQuery({
    queryKey: ['seven-zip'],
    queryFn: getSevenZip,
    ...fixedDataQueryOptions,
    meta: {
      disablePersist: true,
    },
  })
}
