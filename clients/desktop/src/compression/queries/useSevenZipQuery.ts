import { getSevenZip } from '@core/keygen/compression/getSevenZip'
import { useQuery } from '@tanstack/react-query'

import { fixedDataQueryOptions } from '../../lib/ui/query/utils/options'

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
