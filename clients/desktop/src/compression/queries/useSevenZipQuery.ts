import { getSevenZip } from '@core/mpc/compression/getSevenZip'
import { fixedDataQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'

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
